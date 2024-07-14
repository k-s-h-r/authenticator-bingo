'use server';
import { cookies } from 'next/headers';

export async function onAiDisplay(flg: boolean) {
  const cookieStore = cookies();
  // const isAiDisplay = cookieStore.get('isAiDisplay')?.value ?? '';
  cookieStore.set('isAiDisplay', JSON.stringify(flg));
}
