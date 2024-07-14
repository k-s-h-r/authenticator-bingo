'use server';

import { drizzle } from 'drizzle-orm/d1';
import { BingoGroups } from '@/db/schema';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export type State = {
  message?: string | null;
};

export async function onGroupNameChangeSubmit(
  state: State,
  formData: FormData,
) {
  let userId = cookies().get('userId')?.value;
  const db = drizzle(process.env.DB);
  const groupId = (formData.get('groupId') as string) ?? '';
  const groupName = (formData.get('groupName') as string) ?? '';

  /*
  if (!userId) {
    return {
      message: 'userIdがありません',
    };
  }
  */

  if (!groupName) {
    return {
      message: 'GroupNameが有効な値ではありません',
    };
  }
  if (!groupId) {
    return {
      message: 'GroupIdが有効な値ではありません',
    };
  }

  // DBに記録
  await db
    .update(BingoGroups)
    .set({
      group_name: groupName,
    })
    .where(eq(BingoGroups.group_id, groupId));

  revalidatePath('/bingo/[groupId]', 'page');
}
