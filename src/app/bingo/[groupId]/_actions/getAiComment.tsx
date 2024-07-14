'use server';

import type { BingoCard } from '@/db/schema';
import { streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

const displayBingoBoard = (bingoArray: BingoCard['bingo_board']) => {
  const board = bingoArray
    .map((row) => row.map((cell) => (cell.is_open ? '●' : '◯')).join(''))
    .join('\n');
  return board;
};

const commentList = [
  '素晴らしい！ビンゴのチャンスが見えてきたかも！みんな頑張って！',
  'これはドキドキの展開ですね！次の数字に期待しましょう！',
  'あなたの運が試される瞬間がやってきました！次の数字に注目！',
  'みんなのビンゴ盤がだんだんと埋まってきていますね！興奮が高まります！',
  'この勢いでどんどんマークしていきましょう！ビンゴまであと少し！',
  'お、ここで重要なマスが埋まりました！次はどの数字が来るか楽しみですね！',
  'さぁ、ビンゴへの道のりはもうすぐ！最後まで全力で楽しんでください！',
  'あなたの運命の数字が迫ってきています！次はどの数字が出るかワクワクしますね！',
  'みんなのビンゴ盤が賑やかになってきました！次の数字も楽しみに！',
  'これは見逃せない展開ですね！ビンゴの瞬間はすぐそこかも！',
  '次の数字がビンゴに近づけるかも！みんなの運に期待しましょう！',
  'ビンゴの予感が漂ってきています！次の数字に全神経を集中！',
  'みんなの笑顔が増えてきていますね！このまま盛り上がりましょう！',
  '次の数字が運命を変えるかも！ビンゴの瞬間を楽しみに待ちましょう！',
  '熱い展開が続いていますね！次の数字がどんなドラマを生むか注目です！',
  'さぁ、次の数字がどうなるか！ビンゴのチャンスが広がっています！',
  '次の数字に期待！ビンゴまでのカウントダウンが始まりました！',
  'ビンゴの瞬間が近づいてきています！最後まで楽しんでいきましょう！',
  'ドキドキが止まりませんね！次の数字がビンゴへの一歩かも！',
  'これは目が離せない展開です！次の数字に期待して盛り上がりましょう！',
];
function getRandomComment() {
  const randomIndex = Math.floor(Math.random() * commentList.length);
  return <span>{commentList[randomIndex]}</span>;
}

export async function getAiComment({
  bingoCard,
  isBingo,
  isReach,
  needsAi,
  reachNumbers,
  bingoNumbers,
}: {
  bingoCard: BingoCard;
  isBingo: boolean;
  isReach: boolean;
  needsAi: boolean;
  reachNumbers: string[];
  bingoNumbers: string[][];
}) {
  if (needsAi) {
    try {
      // APIとやり取り
      const result = await streamUI({
        model: openai('gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: `あなたはビンゴゲームの実況者です。
            以下の指示に従って実況を行ってください。
            ・ユーザーのビンゴ盤面を見ておもしろおかしく実況を行ってください。（話はじめに「おっと」などの言葉は不要です）
            ・リーチやビンゴになった時にコメントを依頼するのでゲーム参加者がやる気を出す様な、楽しくなる様なコメントにしてください。
            ・ユーザーはビンゴ盤面のJSONデータをあなたに渡します。あなたはそのデータを見てコメントをしてください。
            ・盤面のJSONデータは1行づつの配列データです。各マスのデータのis_bingo,is_reachは無視してください。
            ・渡されるビンゴ盤面はゲーム途中のものになるので始まりの挨拶などは不要です。盤面からわかる情報だけを伝えてください。
            ・実況コメントは70文字程度で返却してください。
            ・真ん中FREEマスは必ず空いています。●は空いているマス。◯は埋まっているマスです。
            ・今回は${bingoCard.last_open_number}のマスを開けました。
            ・${isBingo && `${bingoCard.last_open_number}のマスを開けビンゴができあがりました。`}${isReach && `${bingoCard.last_open_number}のマスを開けリーチが発生しました。`}
            ・ビンゴ、もしくはリーチが発生した時は実況で盛り上げてください。
            ・リーチの番号は「${reachNumbers.join('、')}」です。
            ・ビンゴしている番号は${bingoNumbers.map((row, index) => row.join(`${index + 1}つ目: ${row.join(',')}`)).join('と')}です。
            ・現在のリーチ数は${bingoCard.reach_count}。ビンゴ数は${bingoCard.bingo_count}です。`,
          },
          {
            role: 'user',
            content: `
            ・JSONデータ: ${JSON.stringify(bingoCard.bingo_board)}
            ・盤面: ${displayBingoBoard(bingoCard.bingo_board)}
            `,
          },
        ],
        text: ({ content }) => <span>{content}</span>,
        tools: {},
        temperature: 0.9,
        maxTokens: 150,
      });

      return {
        message: result.value,
      };
    } catch (error) {
      console.error(error);
      return {
        error: 'エラーが発生しました',
      };
    }
  } else {
    return {
      message: getRandomComment(),
    };
  }
}
