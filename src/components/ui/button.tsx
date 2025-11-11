import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none ...',
  {
    variants: {
      variant: {
        default:
          'inline-flex items-center justify-center text-3xl font-medium duration-100 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] p-[var(--spacing-xs)] w-full rounded-[var(--rounded-l)] border-0 hover:bg-[rgb(var(--color-brand-dark))] hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-[rgb(var(--color-brand-darker))] active:border-[rgb(var(--color-primary-600))] active:border-3',
        secondary:
          'inline-flex items-center justify-center text-3xl font-medium duration-100 bg-[rgb(var(--background))] text-[rgb(var(--primary))] p-[var(--spacing-xs)] w-full rounded-[var(--rounded-l)] border-[rgb(var(--color-primary-700))] hover:bg-[rgb(var(--color-brand-dark))] hover:text-[rgb(var(--background))] hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-[rgb(var(--color-brand-darker))] active:border-[rgb(var(--color-primary-600))] active:border-3',
        iconPrimary:
          'inline-flex items-center justify-center text-3xl font-medium duration-100 bg-[rgb(var(--primary))] p-[var(--spacing-xs)] text-[rgb(var(--primary-foreground))] rounded-[var(--rounded-l)] border-0  hover:bg-[rgb(var(--color-brand-dark))] hover:text-[rgb(var(--background))] hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-[rgb(var(--color-brand-darker))] active:border-[rgb(var(--color-primary-600))] active:border-3',
        iconSecondary:
          'inline-flex items-center justify-center text-3xl font-medium duration-100 bg-[rgb(var(--background))] text-[rgb(var(--primary))] p-[var(--spacing-xs)] rounded-[var(--rounded-l)] border-[rgb(var(--color-primary-700))] hover:bg-[rgb(var(--color-brand-dark))] hover:text-[rgb(var(--background))] hover:shadow-[0_8px_14px_-5px_rgb(var(--primary)/60%)] active:bg-[rgb(var(--color-brand-darker))] active:border-[rgb(var(--color-primary-600))] active:border-3',
        link: 'text-primary underline-offset-4 hover:underline ...',
      },
      size: {
        default: 'h-9 px-4 py-2 ...',
        sm: 'h-8 rounded-md ...',
        lg: 'h-10 rounded-lg ...',
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
