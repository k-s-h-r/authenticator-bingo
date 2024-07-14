'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { CheckIcon, ClipboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

interface CopyButtonProps extends ButtonProps {
  value: string;
  src?: string;
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value);
}

export function CopyButton({
  value,
  className,
  src,
  variant = 'ghost',
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (hasCopied) {
        setHasCopied(false);
      }
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      type="button"
      size="icon"
      variant={variant}
      className={cn('relative z-10 h-6 w-6 [&_svg]:h-3 [&_svg]:w-3', className)}
      onClick={() => {
        copyToClipboardWithMeta(value);
        setHasCopied(true);
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  );
}
