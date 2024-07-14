'use server';

import { drizzle } from 'drizzle-orm/d1';
import { BingoGroups, GroupParticipants, BingoCards } from '@/db/schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export type State = {
  message?: string | null;
};

export async function onDeleteGroup(state: State, formData: FormData) {
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

  // グループが自分のものか確認
  const group = await db
    .select()
    .from(BingoGroups)
    .where(
      and(eq(BingoGroups.group_id, groupId), eq(BingoGroups.user_id, userId)),
    )
    .get();

  if (!group) {
    return {
      message: '削除権限がありません',
    };
  }

  // 削除
  await db
    .delete(GroupParticipants)
    .where(eq(GroupParticipants.group_id, groupId));

  await db.delete(BingoCards).where(eq(BingoCards.group_id, groupId));

  await db
    .delete(BingoGroups)
    .where(
      and(eq(BingoGroups.group_id, groupId), eq(BingoGroups.user_id, userId)),
    );

  revalidatePath('/');
  redirect('/');
}
