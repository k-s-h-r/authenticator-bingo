import type { InferSelectModel } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
// import { ulid } from 'ulidx';

export const Users = sqliteTable('Users', {
  user_id: text('user_id').primaryKey().notNull(),
  user_name: text('username'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const BingoGroups = sqliteTable('BingoGroups', {
  group_id: text('group_id').primaryKey().notNull(),
  group_name: text('group_name'),
  user_id: text('user_id')
    .notNull()
    .references(() => Users.user_id),
  created_at: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const GroupParticipants = sqliteTable(
  'GroupParticipants',
  {
    group_id: text('group_id')
      .notNull()
      .references(() => BingoGroups.group_id),
    user_id: text('user_id')
      .notNull()
      .references(() => Users.user_id),
  },
  (table) => {
    return {
      pk0: primaryKey({
        columns: [table.group_id, table.user_id],
        name: 'GroupParticipants_group_id_user_id_pk',
      }),
    };
  },
);

export const BingoCards = sqliteTable('BingoCards', {
  card_id: integer('card_id').primaryKey({ autoIncrement: true }),
  user_id: text('user_id')
    .notNull()
    .references(() => Users.user_id),
  group_id: text('group_id')
    .notNull()
    .references(() => BingoGroups.group_id),
  bingo_board: text('bingo_board', { mode: 'json' })
    .notNull()
    .$type<BingoBoard>(),
  bingo_count: integer('bingo_count').notNull().default(0),
  reach_count: integer('reach_count').notNull().default(0),
  first_bingo_datetime: text('first_bingo_datetime'),
  last_open_number: integer('last_open_number'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type BingoCell = {
  number: string;
  is_open: boolean;
  is_reach: boolean;
  is_bingo: boolean;
};
export type BingoBoard = BingoCell[][];
export type BingoCard = InferSelectModel<typeof BingoCards>;
export type User = InferSelectModel<typeof Users>;
export type OtherParticipant = {
  card_id: BingoCard['card_id'];
  group_id: BingoCard['group_id'];
  user_name: User['user_name'];
  bingo_board: BingoBoard;
  bingo_count: BingoCard['bingo_count'];
  reach_count: BingoCard['reach_count'];
  first_bingo_datetime: BingoCard['first_bingo_datetime'];
  created_at: BingoCard['created_at'];
  updated_at: BingoCard['updated_at'];
};
