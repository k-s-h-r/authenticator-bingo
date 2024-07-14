'use client';
import type { BingoCard, BingoBoard, BingoCell } from '@/db/schema';
import { useTransition } from 'react';
import { getAiComment } from '../_actions/getAiComment';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  needsAIComment,
  getReachNumbers,
  getBingoNumbers,
} from '../_lib/checkBingo';
import { Button } from '@/components/ui/button';
import { Cross1Icon } from '@radix-ui/react-icons';
import { onAiDisplay } from '../_actions/onAiDisplay';
import { useEffectOnce } from 'react-use';

type Bingo = {
  bingoCard: BingoCard;
  isAiDisplay?: boolean;
};

export function AiRobo({ bingoCard, isAiDisplay }: Bingo) {
  const [isAiRobo, setIsAiRobo] = useState(isAiDisplay);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className={cn(['fixed bottom-6 right-6 z-50 w-16 sm:w-24'])}>
        {isAiRobo && (
          <>
            <Button
              className="absolute -right-1 -top-2 size-6 rounded-full"
              type="button"
              size="icon"
              variant="default"
              onClick={() =>
                startTransition(async () => {
                  setIsAiRobo(false);
                  await onAiDisplay(false);
                })
              }
            >
              <Cross1Icon />
              <span className="sr-only">実況OFF</span>
            </Button>
            <AiRoboContents bingoCard={bingoCard} />
          </>
        )}
        {!isAiRobo && (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                setIsAiRobo(true);
                await onAiDisplay(true);
              })
            }
          >
            実況ON
          </Button>
        )}
      </div>
    </>
  );
}

export function AiRoboContents({ bingoCard }: Bingo) {
  const [isPending, startTransition] = useTransition();
  const [streamComponent, setStreamComponent] = useState<React.ReactNode>();
  const prevBingoCountRef = useRef<number>();
  const prevReachCountRef = useRef<number>();
  const prevBingoBoardRef = useRef<BingoCard['bingo_board']>();
  const bingoBoard = bingoCard.bingo_board;

  const onSubmit = useCallback(
    ({
      bingoCard,
      isBingo,
      isReach,
      isFirst,
    }: {
      bingoCard: BingoCard;
      isBingo: boolean;
      isReach: boolean;
      isFirst?: boolean;
    }) => {
      startTransition(async () => {
        try {
          const needsAi = needsAIComment({
            bingoCard,
            isBingo,
            isReach,
          });
          const res = await getAiComment({
            bingoCard,
            isBingo,
            isReach,
            needsAi: isFirst ? false : needsAi,
            reachNumbers: getReachNumbers(bingoCard.bingo_board),
            bingoNumbers: getBingoNumbers(bingoCard.bingo_board),
          });
          if (res?.message) {
            setStreamComponent(res.message);
          }
          if (res?.error) {
            console.error(res.error);
          }
        } catch (e) {
          console.error(e);
        }
      });
    },
    [],
  );

  useEffectOnce(() => {
    onSubmit({ bingoCard, isBingo: false, isReach: false, isFirst: true });
  });

  useEffect(() => {
    if (
      prevBingoBoardRef.current !== undefined &&
      prevBingoCountRef.current !== undefined &&
      prevReachCountRef.current !== undefined
    ) {
      if (prevBingoCountRef.current !== bingoCard.bingo_count) {
        // bingoが優先
        onSubmit({ bingoCard, isBingo: true, isReach: false });
      } else if (prevReachCountRef.current !== bingoCard.reach_count) {
        onSubmit({ bingoCard, isBingo: false, isReach: true });
      } else {
        onSubmit({ bingoCard, isBingo: false, isReach: false });
      }
    }

    prevBingoCountRef.current = bingoCard.bingo_count;
    prevReachCountRef.current = bingoCard.reach_count;
    prevBingoBoardRef.current = bingoCard.bingo_board;
  }, [onSubmit, bingoCard, bingoBoard]);

  return (
    <>
      <Image src="/aibot.png" width={145} height={263} alt="" className="" />
      {streamComponent && (
        <div
          className={cn([
            'fixed bottom-8 right-24 ml-4 max-w-80 rounded-2xl border-2 border-slate-700 bg-background p-2 sm:bottom-12 sm:right-32 sm:p-4',
          ])}
        >
          <p className="text-sm" aria-live="polite">
            {streamComponent}
          </p>
        </div>
      )}
    </>
  );
}
