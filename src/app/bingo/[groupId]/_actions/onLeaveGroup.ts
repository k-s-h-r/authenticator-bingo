'use server';

import { drizzle } from 'drizzle-orm/d1';
import { BingoGroups, GroupParticipants, BingoCards } from '@/db/schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export type State = {
  message?: string | null;
};

export async function onLeaveGroup(state: State, formData: FormData) {
  let userId = cookies().get('userId')?.value;
  const db = drizzle(process.env.DB);
  const groupId = (formData.get('groupId') as string) ?? '';

  if (!userId) {
    return {
      message: 'userIdがありません',
    };
  }
  if (!groupId) {
    return {
      message: 'GroupIdが有効な値ではありません',
    };
  }

  // 退出
  // グループからユーザーを削除
  await db
    .delete(GroupParticipants)
    .where(
      and(
        eq(GroupParticipants.group_id, groupId),
        eq(GroupParticipants.user_id, userId),
      ),
    )
    .returning();

  // ビンゴカードの削除
  await db
    .delete(BingoCards)
    .where(
      and(eq(BingoCards.group_id, groupId), eq(BingoCards.user_id, userId)),
    )
    .returning();

  revalidatePath('/bingo/[groupId]', 'page');
}
