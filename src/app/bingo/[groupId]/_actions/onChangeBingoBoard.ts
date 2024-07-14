'use server';

import type { BingoBoard, BingoCell } from '@/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { BingoCards, type BingoCard } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { checkBingo } from '../_lib/checkBingo';
import { revalidatePath } from 'next/cache';
import { cn } from '@/lib/utils';
import { getDbGroup, getDbOtherParticipants, getDbBingoCard } from '../_db';
import { convertUTCToJST, formatSqLiteDateToUTCString } from '@/lib/utils';

export async function onChangeBingoBoard(
  formData: FormData,
  { groupId, userId }: { groupId: string; userId: string },
) {
  const db = drizzle(process.env.DB);
  const position = (formData.get('position') as string) ?? '[]';
  const [row, cell] = JSON.parse(position) as [number, number];

  // ビンゴカード取得
  const bingoCard = await getDbBingoCard(db, { groupId, userId });

  if (!bingoCard) {
    throw new Error('Bingo Card not found');
  }

  // 指定されたセルを更新
  bingoCard.bingo_board[row][cell].is_open = true;

  // ビンゴ判定
  const { isBingo, bingoCount, reachCount, updatedBingoBoard } = checkBingo(
    bingoCard.bingo_board,
  );

  // DBに記録
  await db
    .update(BingoCards)
    .set({
      bingo_count: bingoCount,
      reach_count: reachCount,
      bingo_board: updatedBingoBoard,
      updated_at: formatSqLiteDateToUTCString(new Date()),
    })
    .where(eq(BingoCards.card_id, bingoCard.card_id));

  revalidatePath('/bingo/[groupId]', 'page');

  return {};
}
