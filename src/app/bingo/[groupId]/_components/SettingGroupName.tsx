'use client';

import type { InferSelectModel } from 'drizzle-orm';
import * as React from 'react';
import type { BingoGroups } from '@/db/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { onGroupNameChangeSubmit } from '../_actions/onGroupNameChangeSubmit';
import { useTransition } from 'react';

type BingoGroup = InferSelectModel<typeof BingoGroups>;

export function SettingGroupName({
  group,
  className,
}: {
  group: BingoGroup;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn('', className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={group.group_name ? 'ghost' : 'outline'}
            size={group.group_name ? 'icon' : 'sm'}
            className={cn(group.group_name && 'h-6 w-6 [&_svg]:size-4')}
          >
            <span className={group.group_name ? 'sr-only' : ''}>設定する</span>
            <Pencil1Icon className={group.group_name ? '' : 'ml-1'} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
            <DialogDescription>
              ここでグループ名を変更します。完了したら、「変更する」をクリックします。
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            groupId={group.group_id}
            groupName={group.group_name}
            setOpen={setOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupForm({
  className,
  groupName,
  groupId,
  setOpen,
}: React.ComponentProps<'form'> & {
  groupId: string;
  groupName?: string | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [state, setState] = React.useState<{ message?: string | null }>({});
  const [isPending, startTransition] = useTransition();
  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await onGroupNameChangeSubmit({}, formData);
      if (res?.message) {
        setState(res);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <form action={onSubmit} className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="group">Group Name</Label>
        <Input
          id="groupName"
          name="groupName"
          required
          defaultValue={groupName ?? undefined}
        />
        {state?.message && (
          <span className="mt-1 text-sm font-medium text-destructive">
            {state.message}
          </span>
        )}
      </div>
      <input type="hidden" name="groupId" value={groupId} />
      <Button type="submit" disabled={isPending}>
        変更する
      </Button>
    </form>
  );
}
