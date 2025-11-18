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
        badge:
          'bg-[rgb(var(--background))] text-[rgb(var(--primary))] p-[var(--spacing-xs)] border-[var(--primary)] rounded-[var(--rounded-xl)] hover:bg-[rgb(var(--color-brand-dark))] hover:text-[rgb(var(--background))] hover:border-4 hover:border-[rgb(var(--primary))] hover:shadow-primary-glow active:border-4 active:border-[rgb(var(--primary))] active:p-[var(--spacing-xxs)] [&_svg]:p-[var(--spacing-xs)] [&_svg]:size-[18px] [&_svg]:border-2 [&_svg]:rounded-[var(--rounded-l)] [&_svg]:border-[rgb(var(--primary))] ',
        social:
          'bg-[rgb(var(--background))] text-[rgb(var(--primary))] p-[var(--spacing-xs)] border-[var(--primary)] rounded-[var(--rounded-xl)] hover:bg-[rgb(var(--color-brand-dark))] hover:text-[rgb(var(--background))] active:border-4 hover:border-[rgb(var(--primary))] hover:shadow-primary-glow active:border-4 active:border-[rgb(var(--primary))] active:p-[var(--spacing-xxs)] [&_svg]:p-[var(--spacing-xs)] [&_svg]:size-[18px] [&_svg]:border-2 [&_svg]:rounded-[var(--rounded-l)] [&_svg]:border-[rgb(var(--primary))] ',
        card: 'bg-[rgb(var(--color-secondary-5050))] p-[var(--spacing-xs)] text-[rgb(var(--color-secondary-50))] backdrop-blur-[10px] p-[var(--spacing-xs)] rounded-[var(--rounded-l)] border-0 hover:bg-[rgb(var(--color-secondary-700)]',
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

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
