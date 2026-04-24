import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';

type AdminActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const toneClasses: Record<AdminActionTone, string> = {
  neutral: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300/70',
  primary: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-200',
  success: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-200',
  warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus-visible:ring-amber-200',
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-200',
};

type AdminActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  label: string;
  tone?: AdminActionTone;
};

export function AdminActionButton({
  asChild = false,
  children,
  className,
  label,
  tone = 'neutral',
  type = 'button',
  ...props
}: AdminActionButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Comp
          aria-label={label}
          title={label}
          className={cn(
            'inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-white/90 align-middle transition-all duration-200 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0',
            toneClasses[tone],
            className,
          )}
          {...(!asChild ? { type } : {})}
          {...props}
        >
          {children}
        </Comp>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

type AdminActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function AdminActionGroup({ className, ...props }: AdminActionGroupProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 whitespace-nowrap', className)}
      {...props}
    />
  );
}