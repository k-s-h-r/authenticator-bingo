'use client';

import * as React from 'react';
import type { OtherParticipant } from '@/db/schema';
import { PreviewBingoBoard } from '@/app/_components/PreviewBingoBoard';
import { CopyButton } from '@/app/_components/CopyButton';

export function OtherParticipantsSection({
  otherParticipants,
}: {
  otherParticipants: OtherParticipant[];
}) {
  const [url, setUrl] = React.useState('');
  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <section className="grid grid-flow-row gap-2">
      <h2 className="text-base font-bold sm:text-lg">
        このビンゴグループに参加中の他のユーザー
      </h2>
      {otherParticipants.length === 0 && (
        <div>
          <p className="text-sm sm:text-base">
            このグループにはまだ他のユーザーが参加していません。
            <br />
            他のユーザーを招待して一緒にビンゴを楽しみましょう！
          </p>
          {url && (
            <p className="mt-2 inline-block break-all rounded-md bg-muted px-2 py-1 text-sm">
              {url} <CopyButton value={url} />
            </p>
          )}
        </div>
      )}
      {!!otherParticipants.length && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {otherParticipants.map((bingo) => (
            <div key={bingo.card_id}>
              <PreviewBingoBoard
                bingoCount={bingo.bingo_count}
                reachCount={bingo.reach_count}
                username={bingo.user_name}
                bingoCardUpdatedAt={bingo.updated_at}
                bingoBoard={bingo.bingo_board}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
