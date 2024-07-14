'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { UpdateIcon } from '@radix-ui/react-icons';

export function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="" size="lg" disabled={pending}>
      {pending && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
      <span>新しくビンゴを始める</span>
    </Button>
  );
}
