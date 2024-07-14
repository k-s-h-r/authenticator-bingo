import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, applyOffset, offset } from '@formkit/tempo';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertUTCToJST(utcString: string) {
  if (!utcString) return '';

  // 日付の初期化
  const utcDate = new Date(utcString);
  // 実行環境とUTCとの差分（単位：時間）を取得
  const timezoneOffset = new Date().getTimezoneOffset() + 9 * 60 * 60 * 1000;
  // 実行環境とUTCとの差分をUTC時間に足して日付を初期化
  const date = new Date(utcDate.getTime() + timezoneOffset);
  return format(date, 'YYYY/MM/DD HH:mm');
}

export function formatSqLiteDateToUTCString(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
