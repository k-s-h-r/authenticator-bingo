import type { BingoBoard, BingoCell, BingoCard } from '@/db/schema';

/**
 * ビンゴしている数字を抜き出す関数
 * @param {BingoBoard} board - ビンゴボード
 * @returns {string[][]} - ビンゴしている数字の配列
 */
export function getBingoNumbers(board: BingoBoard): string[][] {
  const bingoNumbers: string[][] = [];

  // チェック関数: 5つのセルがビンゴ状態かどうか確認し、ビンゴ中のマスの番号を取得
  function checkLine(line: BingoCell[]): void {
    const bingoCells = line.filter((cell) => cell.is_bingo);

    if (bingoCells.length === 5) {
      bingoNumbers.push(bingoCells.map((cell) => cell.number));
    }
  }

  // 縦のラインをチェック
  for (let col = 0; col < 5; col++) {
    const column = board.map((row) => row[col]);
    checkLine(column);
  }

  // 横のラインをチェック
  for (const row of board) {
    checkLine(row);
  }

  // 斜めのラインをチェック (左上から右下)
  const diagonal1 = board.map((row, idx) => row[idx]);
  checkLine(diagonal1);

  // 斜めのラインをチェック (右上から左下)
  const diagonal2 = board.map((row, idx) => row[4 - idx]);
  checkLine(diagonal2);

  return bingoNumbers;
}

/**
 * ビンゴボードからリーチ中のマスの番号を出力する関数
 * @param {BingoBoard} board - ビンゴボード
 * @returns {string[]} - リーチ中のマスの番号の配列
 */
export function getReachNumbers(board: BingoBoard): string[] {
  const reachNumbers: string[] = [];

  // チェック関数: 4つのセルがリーチ状態かどうか確認し、リーチ中のマスの番号を取得
  function checkLine(line: BingoCell[]): void {
    const reachCells = line.filter((cell) => cell.is_reach);
    const openCells = line.filter((cell) => !cell.is_open);

    if (reachCells.length === 4 && openCells.length === 1) {
      reachNumbers.push(openCells[0].number);
    }
  }

  // 縦のラインをチェック
  for (let col = 0; col < 5; col++) {
    const column = board.map((row) => row[col]);
    checkLine(column);
  }

  // 横のラインをチェック
  for (const row of board) {
    checkLine(row);
  }

  // 斜めのラインをチェック (左上から右下)
  const diagonal1 = board.map((row, idx) => row[idx]);
  checkLine(diagonal1);

  // 斜めのラインをチェック (右上から左下)
  const diagonal2 = board.map((row, idx) => row[4 - idx]);
  checkLine(diagonal2);

  return reachNumbers;
}

export function hasEnoughOpenCells(bingoBoard: BingoBoard, count: number) {
  let openCount = 0;

  for (const row of bingoBoard) {
    for (const cell of row) {
      if (cell.is_open) {
        openCount++;
        if (openCount >= count) {
          return true;
        }
      }
    }
  }

  return false;
}

export function needsAIComment({
  bingoCard,
  isBingo,
  isReach,
}: {
  bingoCard: BingoCard;
  isBingo: boolean;
  isReach: boolean;
}) {
  // true = ai, false = text
  if (!isBingo && !isReach && !hasEnoughOpenCells(bingoCard.bingo_board, 5)) {
    // 5つ以上のマスが開いていない場合はAIに聞かない
    return false;
  } else if (isBingo || isReach) {
    return true;
  } else {
    const randam = Math.random();
    const randomChoice =
      randam < 0.3 // 30%の確率で
        ? true
        : false;
    return randomChoice;
  }
}

export function checkBingo(bingoBoard: BingoBoard): {
  isBingo: boolean;
  bingoCount: number;
  reachCount: number;
  updatedBingoBoard: BingoBoard;
} {
  const size = 5;
  const freeCellPosition = { row: 2, col: 2 }; // 中央のフリースポット

  const rows = Array(size).fill(0);
  const cols = Array(size).fill(0);
  let diag1 = 0;
  let diag2 = 0;

  let bingoCount = 0;
  let reachCount = 0;

  const updatedBingoBoard = bingoBoard.map((row) =>
    row.map((cell) => ({ ...cell, is_bingo: false, is_reach: false })),
  );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        bingoBoard[i][j].is_open ||
        (i === freeCellPosition.row && j === freeCellPosition.col)
      ) {
        rows[i]++;
        cols[j]++;
        if (i === j) diag1++;
        if (i + j === size - 1) diag2++;
      }
    }
  }

  // ビンゴのカウントとビンゴ中のセルのマーキング
  for (let i = 0; i < size; i++) {
    if (rows[i] === size) {
      bingoCount++;
      for (let j = 0; j < size; j++) {
        updatedBingoBoard[i][j].is_bingo = true;
      }
    }
    if (cols[i] === size) {
      bingoCount++;
      for (let j = 0; j < size; j++) {
        updatedBingoBoard[j][i].is_bingo = true;
      }
    }
  }
  if (diag1 === size) {
    bingoCount++;
    for (let i = 0; i < size; i++) {
      updatedBingoBoard[i][i].is_bingo = true;
    }
  }
  if (diag2 === size) {
    bingoCount++;
    for (let i = 0; i < size; i++) {
      updatedBingoBoard[i][size - 1 - i].is_bingo = true;
    }
  }

  // リーチのカウントとリーチ中のセルのマーキング
  for (let i = 0; i < size; i++) {
    if (rows[i] === size - 1) {
      reachCount++;
      for (let j = 0; j < size; j++) {
        if (!updatedBingoBoard[i][j].is_bingo) {
          updatedBingoBoard[i][j].is_reach = true;
        }
      }
    }
    if (cols[i] === size - 1) {
      reachCount++;
      for (let j = 0; j < size; j++) {
        if (!updatedBingoBoard[j][i].is_bingo) {
          updatedBingoBoard[j][i].is_reach = true;
        }
      }
    }
  }
  if (diag1 === size - 1) {
    reachCount++;
    for (let i = 0; i < size; i++) {
      if (!updatedBingoBoard[i][i].is_bingo) {
        updatedBingoBoard[i][i].is_reach = true;
      }
    }
  }
  if (diag2 === size - 1) {
    reachCount++;
    for (let i = 0; i < size; i++) {
      if (!updatedBingoBoard[i][size - 1 - i].is_bingo) {
        updatedBingoBoard[i][size - 1 - i].is_reach = true;
      }
    }
  }

  return { isBingo: bingoCount > 0, bingoCount, reachCount, updatedBingoBoard };
}
