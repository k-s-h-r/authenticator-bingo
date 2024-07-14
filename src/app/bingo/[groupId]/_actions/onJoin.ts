'use server';

import { drizzle } from 'drizzle-orm/d1';
import { Users, BingoCards, GroupParticipants, BingoGroups } from '@/db/schema';
import { ulid } from 'ulidx';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import generateBingoBoard from '@/app/_lib/generateBingoBoard';
import { revalidatePath } from 'next/cache';

export async function onJoin(formData: FormData) {
  let userId = cookies().get('userId')?.value;
  const db = drizzle(process.env.DB);
  const groupId = (formData.get('groupId') as string) ?? '';

  if (!groupId) {
    // 基本的にはgroudIdがない場合はないのでなにもしない
    return;
  }

  if (!userId) {
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

  revalidatePath('/bingo/[groupId]', 'page');
}
