import type { BingoBoard, BingoCell } from '@/db/schema';
import { cn } from '@/lib/utils';

function extractNumbers(cells: BingoCell[]): string[] {
  return cells.map((cell) => cell.number);
}

function replaceFree(str: string) {
  return str === 'FREE' ? '★' : str;
}

export function BingoBoardTable({ bingoBoard }: { bingoBoard: BingoBoard }) {
  return (
    <div className="bg-muted p-4">
      <table
        className={cn([
          'm-auto w-full max-w-md table-fixed border-collapse text-center',
          '',
        ])}
      >
        <tbody>
          {bingoBoard.map((row, rowIndex) => (
            <tr key={extractNumbers(row).join('-')}>
              {row.map((cell, cellIndex) => (
                <td key={cell.number} className="border bg-background p-0">
                  <>
                    {cell.is_open ? (
                      <div className={cn('grid h-full w-full p-1')}>
                        <span
                          className={cn(
                            'col-start-1 row-start-1 aspect-square size-full place-self-center rounded-full',
                            'bg-green-400',
                            'dark:bg-green-700',
                            cell.is_bingo && 'bg-orange-600 dark:bg-orange-900',
                          )}
                        />
                        {cell.is_bingo && (
                          <span
                            className={cn(
                              'col-start-1 row-start-1 aspect-square size-[90%] place-self-center rounded-full',
                              'bg-orange-300',
                              'dark:bg-orange-700',
                            )}
                          />
                        )}
                        {!cell.is_bingo && cell.is_reach && (
                          <span
                            className={cn(
                              'col-start-1 row-start-1 aspect-square size-[90%] place-self-center rounded-full border-4',
                              'border-green-600 bg-green-400',
                              'dark:border-green-900 dark:bg-green-700',
                            )}
                          />
                        )}
                        <span className="col-start-1 row-start-1 grid h-full place-content-center text-2xl font-bold text-foreground">
                          {replaceFree(cell.number)}
                          {cell.is_bingo && (
                            <span className="sr-only">ビンゴ</span>
                          )}
                          {!cell.is_bingo && cell.is_reach && (
                            <span className="sr-only">リーチ</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="grid h-full w-full">
                        <button
                          type="submit"
                          name="position"
                          value={JSON.stringify([rowIndex, cellIndex])}
                          className={cn([
                            'aspect-square h-full w-full border-0 p-2 text-2xl font-bold text-foreground',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                          ])}
                        >
                          {replaceFree(cell.number)}
                        </button>
                      </div>
                    )}
                  </>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
