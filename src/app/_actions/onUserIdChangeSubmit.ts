'use server';

import { drizzle } from 'drizzle-orm/d1';
import { Users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type State = {
  message?: string | null;
};

export async function onUserIdChangeSubmit(state: State, formData: FormData) {
  const changeUserId = formData.get('userId') as string;
  if (!changeUserId) {
    return {
      message: 'userIdが空です',
    };
  }

  // userIdが存在するか確認
  const db = drizzle(process.env.DB);
  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.user_id, changeUserId))
    .get();

  if (!user) {
    return {
      message: 'エラーが発生しました',
    };
  }

  cookies().set('userId', changeUserId, {
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  });
  revalidatePath('/', 'layout');
}
