import { useState, useEffect, useRef } from 'react';
import type { BingoCard } from '@/db/schema';

type Props = {
  bingoCount: number;
  reachCount: number;
  execBingo?: () => void;
  execReach?: () => void;
};

export const useCountChange = ({
  bingoCount,
  reachCount,
  execBingo,
  execReach,
}: Props) => {
  const prevBingoCountRef = useRef<number>();
  const prevReachCountRef = useRef<number>();
  const prevBingoBoardRef = useRef<BingoCard['bingo_board']>();
  const [isBingo, setIsBingo] = useState(false);
  const [isReach, setIsReach] = useState(false);

  useEffect(() => {
    if (
      prevBingoCountRef.current !== undefined &&
      prevReachCountRef.current !== undefined
    ) {
      if (prevBingoCountRef.current !== bingoCount) {
        setIsBingo(true);
        execBingo && execBingo();
      } else {
        setIsBingo(false);

        // bingoが優先
        if (prevReachCountRef.current !== reachCount) {
          setIsReach(true);
          execReach && execReach();
        } else {
          setIsReach(false);
        }
      }
    }
    prevBingoCountRef.current = bingoCount;
    prevReachCountRef.current = reachCount;
  }, [bingoCount, execBingo, execReach, reachCount]);

  return { isBingo, isReach, setIsBingo, setIsReach };
};
