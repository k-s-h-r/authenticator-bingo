'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import BingoAnimation from '@/components/lottie/Bingo.json';
import ReachAnimation from '@/components/lottie/Reach.json';
import { lazy } from 'react';
import { useCountChange } from '../_hooks/useCountChange';

const Lottie = lazy(() => import('lottie-react'));

type Bingo = {
  bingoCount: number;
  reachCount: number;
};

export function Animation({ bingoCount, reachCount }: Bingo) {
  const { isBingo, isReach, setIsBingo, setIsReach } = useCountChange({
    bingoCount,
    reachCount,
  });

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {isBingo ? 'ビンゴしました' : isReach ? 'リーチです' : ''}
      </p>
      {isBingo && (
        <>
          <Lottie
            autoplay
            loop={false}
            animationData={BingoAnimation}
            className="pointer-events-none"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: 'auto',
              width: '100%',
              zIndex: 1,
              pointerEvents: 'none',
            }}
            onComplete={() => setIsBingo(false)}
          />
        </>
      )}
      {isReach && (
        <>
          <Lottie
            autoplay
            loop={false}
            animationData={ReachAnimation}
            className="pointer-events-none"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: 'auto',
              width: '100%',
              zIndex: 1,
              pointerEvents: 'none',
            }}
            onComplete={() => setIsReach(false)}
          />
        </>
      )}
    </>
  );
}
