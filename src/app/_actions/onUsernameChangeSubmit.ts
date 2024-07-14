'use server';

import { drizzle } from 'drizzle-orm/d1';
import { Users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type State = {
  message?: string | null;
};

export async function onUsernameChangeSubmit(state: State, formData: FormData) {
  const userId = cookies().get('userId')?.value ?? '';
  const db = drizzle(process.env.DB);
  const username = (formData.get('username') as string) ?? '';

  if (!userId) {
    return {
      message: 'userIdがありません',
    };
  }
  if (!username) {
    return {
      message: 'usernameが有効な値ではありません',
    };
  }

  // DBに記録
  await db
    .update(Users)
    .set({
      user_name: username,
    })
    .where(eq(Users.user_id, userId));

  revalidatePath('/', 'layout');
}
