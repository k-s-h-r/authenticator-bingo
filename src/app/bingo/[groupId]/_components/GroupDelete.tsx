'use client';

import type { InferSelectModel } from 'drizzle-orm';
import * as React from 'react';
import type { BingoGroups } from '@/db/schema';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { TrashIcon } from '@radix-ui/react-icons';
import { onDeleteGroup } from '../_actions/onDeleteGroup';
import { useTransition } from 'react';
import { toast } from 'sonner';

type BingoGroup = InferSelectModel<typeof BingoGroups>;

export function GroupDelete({
  group,
  className,
}: {
  group: BingoGroup;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<{ message?: string | null }>({});
  const [isPending, startTransition] = useTransition();
  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await onDeleteGroup({}, formData);

      if (res?.message) {
        toast('エラーが発生しました', {
          description: res.message,
        });
      } else {
        toast(`${group.group_name}を削除しました`);
      }
    });
  };

  return (
    <div className={cn('', className)}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="secondary">
            削除
            <TrashIcon className="ml-1" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[425px]">
          <form
            action={onSubmit}
            className={cn('grid items-start gap-4', className)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                グループ「{group.group_id}」を削除しますか？
              </AlertDialogTitle>
              <AlertDialogDescription>
                削除するとこのグループに参加中の他のユーザーもプレイできなくなります。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <input type="hidden" name="groupId" value={group.group_id} />
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction type="submit">削除する</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
