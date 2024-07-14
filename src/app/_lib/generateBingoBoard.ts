import type { BingoBoard } from '@/db/schema';

export default function generateBingoBoard(): BingoBoard {
  // ランダムな01から99までの番号を生成する関数
  function getRandomNumber(exclude: string[]): string {
    let number: string;
    do {
      number = `0${Math.floor(Math.random() * 99 + 1)}`.slice(-2);
    } while (exclude.includes(number));
    return number;
  }

  // ビンゴカードの初期化
  const bingoCard = [
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
    [{}, {}, { number: 'FREE', is_open: true }, {}, {}],
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}],
  ] as BingoBoard;

  // 重複を避けるための既存番号リスト
  const existingNumbers: string[] = ['FREE'];

  // ビンゴカードにランダムな番号を割り当て
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        continue; // FREEのマスをスキップ
      }
      const number = getRandomNumber(existingNumbers);
      existingNumbers.push(number);
      bingoCard[row][col] = {
        number: number,
        is_open: false,
        is_bingo: false,
        is_reach: false,
      };
    }
  }

  return bingoCard;
}
