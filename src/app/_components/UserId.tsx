'use client';

import type { InferSelectModel } from 'drizzle-orm';
import * as React from 'react';
import type { Users } from '@/db/schema';
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CopyButton } from '@/app/_components/CopyButton';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { onUsernameChangeSubmit } from '../_actions/onUsernameChangeSubmit';
import { onUserIdChangeSubmit } from '../_actions/onUserIdChangeSubmit';
import { useTransition } from 'react';
import { convertUTCToJST } from '@/lib/utils';

type User = InferSelectModel<typeof Users>;

function maskString(input: string): string {
  const length = input.length;
  const halfLength = Math.floor(length / 2);

  if (length === 0) {
    return input;
  }

  return input.slice(0, halfLength) + '*****';
}

export function UserId({ userId, user }: { userId?: string; user?: User }) {
  const [openUserName, setOpenUserName] = React.useState(false);
  const [openUserId, setOpenUserId] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const dialogBtn = React.useRef<HTMLButtonElement>(null);
  const userChangeBtn = React.useRef<HTMLButtonElement>(null);

  if (!userId) {
    return (
      <SetUserId
        openUserId={openUserId}
        setOpenUserId={setOpenUserId}
        userChangeBtn={userChangeBtn}
      />
    );
  }

  return (
    <div className="grid grid-flow-col items-center gap-1">
      <HoverCard open={open} onOpenChange={setOpen}>
        <HoverCardTrigger
          className="text-xs underline-offset-2 hover:underline"
          asChild
          onClick={() => setOpen((prevOpen) => !prevOpen)}
          onFocus={() => setTimeout(() => setOpen(true), 0)} // timeout needed to run this after onOpenChange to prevent bug on mobile
          onBlur={() => setOpen(false)}
        >
          <button type="button">
            User
            <span className="hidden sm:inline">
              : {user?.user_name ?? maskString(userId)}
            </span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="grid gap-4">
            <ul className="grid gap-1 text-xs leading-none">
              <li className="grid grid-flow-col grid-cols-[5rem_auto] items-center gap-2">
                <div className="">User ID: </div>
                <div className="break-all">
                  {user?.user_id} <CopyButton value={userId} />
                </div>
              </li>
              <li className="grid grid-flow-col grid-cols-[5rem_auto] items-center gap-2">
                <div className="">Username: </div>
                <div className="break-all">
                  {user?.user_name ?? '-'}
                  <Button
                    type="button"
                    size="icon"
                    variant={'ghost'}
                    className={cn(
                      'relative z-10 h-6 w-6 [&_svg]:h-3 [&_svg]:w-3',
                    )}
                    onClick={() => dialogBtn.current?.click()}
                  >
                    <Pencil1Icon />
                    <span className="sr-only">Edit Username</span>
                  </Button>
                </div>
              </li>
              <li className="grid grid-flow-col grid-cols-[5rem_auto] items-center gap-2">
                <div className="">Created: </div>
                <div className="break-all">
                  <time dateTime={user?.created_at}>
                    {convertUTCToJST(user?.created_at ?? '')}
                  </time>
                </div>
              </li>
            </ul>

            <Button
              type="button"
              size="sm"
              variant={'secondary'}
              className={cn('grid w-full grid-flow-col gap-1')}
              onClick={() => userChangeBtn.current?.click()}
            >
              <span>ユーザーIDを変更する</span>
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={openUserName} onOpenChange={setOpenUserName}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant={'ghost'}
            className={cn('relative z-10 h-6 w-6 [&_svg]:h-3 [&_svg]:w-3')}
            ref={dialogBtn}
          >
            <Pencil1Icon />
            <span className="sr-only">Edit Username</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Username</DialogTitle>
            <DialogDescription>
              ユーザー名を変更します。完了したら、「変更する」をクリックします。
            </DialogDescription>
          </DialogHeader>
          <div>
            <h3 className="text-sm font-medium leading-none">User ID</h3>
            <p className="break-all">
              {userId} <CopyButton value={userId} />
            </p>
          </div>
          <ChangeUserNameForm
            username={user?.user_name}
            setOpen={setOpenUserName}
          />
        </DialogContent>
      </Dialog>

      <ChangeUserId
        openUserId={openUserId}
        setOpenUserId={setOpenUserId}
        userId={userId}
        userChangeBtn={userChangeBtn}
      />
    </div>
  );
}

function ChangeUserId({
  openUserId,
  setOpenUserId,
  userId,
  userChangeBtn,
}: {
  openUserId: boolean;
  setOpenUserId: React.Dispatch<React.SetStateAction<boolean>>;
  userId?: string;
  userChangeBtn: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <Dialog open={openUserId} onOpenChange={setOpenUserId}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant={'ghost'}
          className={cn('relative z-10 hidden h-6 w-6 [&_svg]:h-3 [&_svg]:w-3')}
          ref={userChangeBtn}
        >
          <Pencil1Icon />
          <span className="sr-only">Change User ID</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User ID</DialogTitle>
          <DialogDescription>
            ユーザーIDを変更します。完了したら、「変更する」をクリックします。
          </DialogDescription>
        </DialogHeader>
        {userId && (
          <div>
            <h3 className="text-sm font-medium leading-none">
              Current User ID
            </h3>
            <p className="break-all">
              {userId} <CopyButton value={userId} />
            </p>
          </div>
        )}
        <ChangeUserIdForm userId={userId} setOpen={setOpenUserId} />
      </DialogContent>
    </Dialog>
  );
}

function SetUserId({
  openUserId,
  setOpenUserId,
  userChangeBtn,
}: {
  openUserId: boolean;
  setOpenUserId: React.Dispatch<React.SetStateAction<boolean>>;
  userChangeBtn: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <Dialog open={openUserId} onOpenChange={setOpenUserId}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={'ghost'}
          className={cn('grid grid-flow-col gap-1')}
          ref={userChangeBtn}
        >
          <Pencil1Icon />
          <span className="text-left leading-tight">
            既存のUser ID
            <br className="sm:hidden" />
            を設定する
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set User ID</DialogTitle>
          <DialogDescription>
            ユーザーIDを設定します。完了したら、「設定する」をクリックします。
          </DialogDescription>
        </DialogHeader>
        <ChangeUserIdForm setOpen={setOpenUserId} />
      </DialogContent>
    </Dialog>
  );
}

function ChangeUserNameForm({
  className,
  username,
  setOpen,
}: React.ComponentProps<'form'> & {
  username?: string | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [state, setState] = React.useState<{ message?: string | null }>({});
  const [isPending, startTransition] = useTransition();
  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await onUsernameChangeSubmit({}, formData);
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
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          defaultValue={username ?? undefined}
        />
        {state?.message && (
          <span className="mt-1 text-sm font-medium text-destructive">
            {state.message}
          </span>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        変更する
      </Button>
    </form>
  );
}

function ChangeUserIdForm({
  className,
  userId,
  setOpen,
}: React.ComponentProps<'form'> & {
  userId?: string | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [state, setState] = React.useState<{ message?: string | null }>({});
  const [isPending, startTransition] = useTransition();
  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await onUserIdChangeSubmit({}, formData);
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
        <Label htmlFor="userId">User Id</Label>
        <Input
          id="userId"
          name="userId"
          required
          defaultValue={userId ?? undefined}
        />
        {state?.message && (
          <span className="mt-1 text-sm font-medium text-destructive">
            {state.message}
          </span>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {userId && <>変更する</>}
        {!userId && <>設定する</>}
      </Button>
    </form>
  );
}
