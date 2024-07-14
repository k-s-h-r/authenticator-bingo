import { cookies } from 'next/headers';
import { drizzle } from 'drizzle-orm/d1';
import { Users, BingoCards, BingoGroups, GroupParticipants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { PreviewBingoBoard } from '@/app/_components/PreviewBingoBoard';
import { onStart } from './_actions/onStart';
import { Button } from '@/components/ui/button';
import { SubmitBtn } from './_components/SubmitBtn';

export const runtime = 'edge';

export default async function Home() {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  const db = drizzle(process.env.DB);

  // ユーザーの参加中のビンゴグループ、ビンゴカードを取得
  const bingos = await db
    .select()
    .from(BingoGroups)
    .innerJoin(
      GroupParticipants,
      eq(GroupParticipants.group_id, BingoGroups.group_id),
    )
    .innerJoin(BingoCards, eq(BingoCards.group_id, BingoGroups.group_id))
    .where(
      and(
        eq(GroupParticipants.user_id, userId),
        eq(BingoCards.user_id, userId),
      ),
    )
    .all();

  // console.log({ bingoCards, bingos });

  return (
    <main className="">
      <div className="grid gap-8">
        <div className="my-6 grid justify-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Authenticator Bingo</h1>
          <p>
            Authenticator
            Bingoは、Authenticatorアプリに表示される2桁の数字を使って遊ぶ、楽しいビンゴゲームです。
            <br />
            スマートフォンとAuthenticatorアプリさえあれば、どこでも簡単に楽しむことができます。
          </p>
          <form action={onStart} className="mt-4">
            <SubmitBtn />
          </form>
        </div>
        <section className="grid grid-flow-row gap-2">
          <h2 className="text-base font-bold sm:text-lg">遊び方</h2>
          <ul className="ml-6 list-decimal text-sm sm:text-base [&>li]:mt-1">
            <li>
              Authenticatorアプリに表示される2桁の数字がビンゴカードにあれば、そのマスをマークします。
            </li>
            <li>
              ビンゴカードの一列（縦・横・斜めのいずれか）に5つのマスがマークされたら、「ビンゴ！」と宣言します。
            </li>
            <li>楽しい一日にします。</li>
          </ul>
        </section>
        <section className="grid grid-flow-row gap-2">
          <h2 className="text-base font-bold sm:text-lg">プレイ中のビンゴ</h2>
          {bingos.length === 0 && (
            <div className="w-full bg-muted p-8">
              <p className="text-center">プレイ中のビンゴはありません</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {bingos.map((bingo) => (
              <div key={bingo.BingoGroups.group_id}>
                <a href={`/bingo/${bingo.BingoGroups.group_id}`}>
                  <PreviewBingoBoard
                    bingoCount={bingo.BingoCards.bingo_count}
                    reachCount={bingo.BingoCards.reach_count}
                    bingoGroup={bingo.BingoGroups}
                    bingoCardUpdatedAt={bingo.BingoCards.updated_at}
                    bingoBoard={bingo.BingoCards.bingo_board}
                  />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
