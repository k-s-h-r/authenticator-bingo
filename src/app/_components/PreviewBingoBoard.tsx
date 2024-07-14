import type { BingoBoard, BingoCell } from '@/db/schema';
import type { BingoGroups } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { convertUTCToJST } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type BingoGroup = InferSelectModel<typeof BingoGroups>;

function extractNumbers(cells: BingoCell[]): string[] {
  return cells.map((cell) => cell.number);
}

function replaceFree(str: string) {
  return str === 'FREE' ? '★' : str;
}

export const PreviewBingoBoard = ({
  bingoCount,
  reachCount,
  bingoBoard,
  bingoGroup,
  bingoCardUpdatedAt,
  username,
}: {
  bingoCount?: number;
  reachCount?: number;
  bingoBoard: BingoBoard;
  bingoGroup?: BingoGroup;
  bingoCardUpdatedAt?: string;
  username?: string | null;
}) => {
  return (
    <div className="grid gap-1">
      <div className="relative rounded-md bg-muted p-1">
        {!!(bingoCount && bingoCount > 0) && (
          <Image
            src="/bingo.svg"
            width={89}
            height={50}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            alt="bingo"
          />
        )}
        <table className="w-full table-fixed border-collapse text-center text-xs">
          <tbody>
            {bingoBoard.map((row, rowIndex) => (
              <tr key={extractNumbers(row).join('-')}>
                {row.map((cell) => (
                  <td
                    key={cell.number}
                    className={cn(
                      'border bg-background p-2',
                      cell.is_open && 'bg-green-400 dark:bg-green-700',
                      cell.is_bingo && 'bg-orange-400 dark:bg-orange-700',
                    )}
                  >
                    <span className="text-foreground">
                      {replaceFree(cell.number)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bingoGroup && bingoGroup.group_name && (
        <p className="break-all text-xs sm:text-sm">
          Group Name: {bingoGroup.group_name}
        </p>
      )}
      {username && <p className="text-xs sm:text-sm">User: {username}</p>}
      <p className="sr-only">ビンゴ数: {bingoCount}</p>
      <p className="sr-only">リーチ数: {reachCount}</p>
      {bingoCardUpdatedAt && (
        <p className="text-xs">
          Last Updated:{' '}
          <time dateTime={bingoCardUpdatedAt}>
            {convertUTCToJST(bingoCardUpdatedAt)}
          </time>
        </p>
      )}
    </div>
  );
};
