import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { Users, BingoCards, BingoGroups } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

type DB = DrizzleD1Database<Record<string, never>>;

// groupIdが存在するか確認
export const getDbGroup = async (
  db: DB,
  {
    groupId,
  }: {
    groupId: string;
  },
) => {
  return await db
    .select()
    .from(BingoGroups)
    .where(eq(BingoGroups.group_id, groupId))
    .get();
};

// groupIdに紐づくビンゴカードを取得
export const getDbOtherParticipants = async (
  db: DB,
  {
    groupId,
    userId,
  }: {
    groupId: string;
    userId: string;
  },
) => {
  return await db
    .select({
      card_id: BingoCards.card_id,
      user_name: Users.user_name,
      group_id: BingoCards.group_id,
      bingo_board: BingoCards.bingo_board,
      bingo_count: BingoCards.bingo_count,
      reach_count: BingoCards.reach_count,
      first_bingo_datetime: BingoCards.first_bingo_datetime,
      created_at: BingoCards.created_at,
      updated_at: BingoCards.updated_at,
    })
    .from(BingoCards)
    .innerJoin(Users, eq(BingoCards.user_id, Users.user_id))
    .where(and(eq(BingoCards.group_id, groupId), ne(Users.user_id, userId)))
    .all();
};

// groupid&userIdに紐づくビンゴカードを取得
export const getDbBingoCard = async (
  db: DB,
  {
    groupId,
    userId,
  }: {
    groupId: string;
    userId: string;
  },
) => {
  return await db
    .select()
    .from(BingoCards)
    .where(
      and(eq(BingoCards.group_id, groupId), eq(BingoCards.user_id, userId)),
    )
    .get();
};
