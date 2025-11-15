import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--rounded-l)] text-sm font-medium transition-all duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'w-full border-0 px-xs py-xs text-3xl bg-primary text-primary-foreground hover:bg-brand-dark hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-brand-darker active:border-primary-600 active:border-m',
        secondary:
          'w-full border border-primary-700 px-xs py-xs text-3xl bg-background text-primary hover:bg-brand-dark hover:text-background hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-brand-darker active:border-primary-600 active:border-m',
        iconPrimary:
          'border-0 px-xs py-xs text-3xl bg-primary text-primary-foreground hover:bg-brand-dark hover:text-background hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-brand-darker active:border-primary-600 active:border-m',
        iconSecondary:
          'border border-primary-700 px-xs py-xs text-3xl bg-background text-primary hover:bg-brand-dark hover:text-background hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-brand-darker active:border-primary-600 active:border-m',
        filter:
          'bg-background text-primary px-xs py-xs border border-primary rounded-xl hover:bg-brand-dark hover:text-background hover:border-0 hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:border-4 active:border-primary active:px-xxs active:py-xxs [&_svg]:p-xs [&_svg]:size-[18px] [&_svg]:border-2 [&_svg]:rounded-l [&_svg]:border-primary',
        card:
          'bg-secondary-50/50 p-xs text-secondary-50 backdrop-blur-[10px] rounded-[var(--rounded-l)] border-0 hover:bg-secondary-700/80',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md',
        lg: 'h-10 rounded-lg',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
