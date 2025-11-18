import * as React from 'react';
import { Button, type ButtonProps } from './button';

interface ButtonWithBadgeProps extends ButtonProps {
  badgeContent?: string | number;
}

const ButtonWithBadge = React.forwardRef<HTMLButtonElement, ButtonWithBadgeProps>(
  ({ badgeContent, children, ...props }, ref) => {
    const ButtonV2 = Button;

    return (
      <div className="relative inline-flex">
        <ButtonV2 variant={'badge'} ref={ref} {...props}>
          {children}
        </ButtonV2>

        {badgeContent && (
          <span
            className="
bg-[rgb(var(--color-brand-dark))]
py-0 px-[var(--spacing-xxs)]
text-[rgb(var(--primary-foreground))]
rounded-[var(--rounded-m)]
border-4 border-[rgb(var(--primary))]

            absolute top-[var(--spacing-x)] right--[var(--spacing-x)]
            translate-x-[3.9rem] -translate-y-1/2 
            flex items-center justify-center
            font-bold
          "
          >
            {badgeContent}
          </span>
        )}
      </div>
    );
  }
);
ButtonWithBadge.displayName = 'ButtonWithBadge';

export { ButtonWithBadge };
