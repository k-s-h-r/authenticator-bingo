import { cookies } from 'next/headers';
import { drizzle } from 'drizzle-orm/d1';
import { BingoCards, BingoGroups, type BingoCard } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { checkBingo } from './_lib/checkBingo';
import { revalidatePath } from 'next/cache';
import { CopyButton } from '@/app/_components/CopyButton';
import { cn } from '@/lib/utils';
import { convertUTCToJST, formatSqLiteDateToUTCString } from '@/lib/utils';
import { NotParticipatingGroup } from './_components/NotParticipatingGroup';
import { NotExistGroup } from './_components/NotExistGroup';
import { BingoBoardTable } from './_components/BingoBoardTable';
import { OtherParticipantsSection } from './_components/OtherParticipantsSection';
import { SettingGroupName } from './_components/SettingGroupName';
import { GroupDelete } from './_components/GroupDelete';
import { GroupLeave } from './_components/GroupLeave';
import { Animation } from './_components/Animation';
import { getDbGroup, getDbOtherParticipants, getDbBingoCard } from './_db';
import type { Metadata } from 'next';
import { AiRobo } from './_components/AiRobo';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: { groupId: string };
}) {
  return {
    title: `Authenticator Bingo | ${params.groupId}`,
  };
}

export default async function BingoGroup({
  params,
}: {
  params: { groupId: string };
}) {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  const db = drizzle(process.env.DB);
  const groupId = params.groupId;
  const dbAiDisplay = cookieStore.get('isAiDisplay')?.value;
  const isAiDisplay = dbAiDisplay === undefined || dbAiDisplay === 'true';

  // groupIdが存在するか確認
  const group = await getDbGroup(db, { groupId });

  if (!group) {
    // bingo groupが存在しない場合
    return <NotExistGroup />;
  }

  // groupIdに紐づくビンゴカードを取得
  const otherParticipants = await getDbOtherParticipants(db, {
    groupId,
    userId,
  });

  // groupid&userIdに紐づくビンゴカードを取得
  const bingoCard = (await getDbBingoCard(db, {
    groupId,
    userId,
  })) as BingoCard;

  // 参加していないグループの場合
  if (!bingoCard) {
    return (
      <NotParticipatingGroup
        otherParticipants={otherParticipants}
        groupId={groupId}
      />
    );
  }

  // グループが自分のものか確認
  const myGroup = await db
    .select()
    .from(BingoGroups)
    .where(
      and(eq(BingoGroups.group_id, groupId), eq(BingoGroups.user_id, userId)),
    )
    .get();

  async function onSubmit(formData: FormData) {
    'use server';

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

  return (
    <main className="">
      <div className={cn('grid gap-8', isAiDisplay && 'mb-40')}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h1 className="text-lg">
              <span className="flex items-center text-base font-bold sm:text-lg">
                <p className="break-all">Group Name: {group.group_name}</p>
                <SettingGroupName group={group} className="ml-2" />
              </span>
            </h1>
            <div className="grid grid-flow-col justify-between gap-4">
              <p className="break-all text-xs sm:text-sm">
                <span>Group ID: {groupId}</span>
                <CopyButton value={groupId} className="ml-2" />
              </p>
              <div className="justify-self-end">
                {!!myGroup && <GroupDelete group={group} />}
                {!myGroup && <GroupLeave group={group} />}
              </div>
            </div>
          </div>

          <div>
            <p className="sr-only" aria-live="polite">
              ビンゴ数: {bingoCard.bingo_count}
            </p>
            <p className="sr-only" aria-live="polite">
              リーチ数: {bingoCard.reach_count}
            </p>
            <form action={onSubmit}>
              <BingoBoardTable bingoBoard={bingoCard.bingo_board} />
            </form>
          </div>
          <p className="text-xs">
            Last Updated:{' '}
            <time dateTime={bingoCard.updated_at}>
              {convertUTCToJST(bingoCard.updated_at)}
            </time>
          </p>
        </div>
        <OtherParticipantsSection otherParticipants={otherParticipants} />

        <Animation
          bingoCount={bingoCard.bingo_count}
          reachCount={bingoCard.reach_count}
        />

        <AiRobo bingoCard={bingoCard} isAiDisplay={isAiDisplay} />
      </div>
    </main>
  );
}
