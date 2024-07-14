'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { OtherParticipantsSection } from './OtherParticipantsSection';
import type { OtherParticipant } from '@/db/schema';
import { onJoin } from '../_actions/onJoin';

export function NotParticipatingGroup({
  otherParticipants,
  groupId,
}: {
  otherParticipants: OtherParticipant[];
  groupId: string;
}) {
  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <h1>このBingo Groupに参加しますか？</h1>
        <div>
          <form action={onJoin}>
            <input type="hidden" name="groupId" value={groupId} />
            <Button type="submit" size="lg">
              参加する
            </Button>
          </form>
        </div>
      </div>

      <OtherParticipantsSection otherParticipants={otherParticipants} />
    </div>
  );
}
