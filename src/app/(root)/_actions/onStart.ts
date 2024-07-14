'use server';

import { drizzle } from 'drizzle-orm/d1';
import { Users, BingoCards, GroupParticipants, BingoGroups } from '@/db/schema';
import { ulid } from 'ulidx';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import generateBingoBoard from '@/app/_lib/generateBingoBoard';
import { eq } from 'drizzle-orm';
import { format } from '@formkit/tempo';

export async function onStart() {
  let userId = cookies().get('userId')?.value ?? '';
  const db = drizzle(process.env.DB);

  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.user_id, userId))
    .get();

  if (!user) {
    // ユーザーの作成
    const user = await db
      .insert(Users)
      .values({ user_id: ulid(), user_name: null })
      .returning()
      .get();

    userId = user.user_id;
  }

  // cookieにuserIdをセット, 更新
  cookies().set('userId', userId, {
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  });

  const groupId = ulid();
  const groupName = user?.user_name ?? groupId;
  const dateStr = format({
    date: new Date(),
    format: 'YYYY-MM-DD HH:mm:ss',
    tz: 'Asia/Tokyo',
  });

  // グループの作成
  const group = await db
    .insert(BingoGroups)
    .values({
      group_id: groupId,
      group_name: `${groupName}のグループ(${dateStr})`,
      user_id: userId,
    })
    .returning()
    .get();

  // console.log({ groupId, userId });

  // グループにユーザーを追加
  await db
    .insert(GroupParticipants)
    .values({ group_id: groupId, user_id: userId });

  // ビンゴ盤面の作成
  const bingoBoard = generateBingoBoard();

  // ビンゴカードの作成
  await db
    .insert(BingoCards)
    .values({
      user_id: userId,
      group_id: groupId,
      bingo_board: bingoBoard,
    })
    .returning();

  redirect(`/bingo/${groupId}`);
}
