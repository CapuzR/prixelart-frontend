import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex items-center justify-center transition-all whitespace-nowrap font-[--font-roboto]',
  {
    variants: {
      variant: {
        default:
          'bg-[rgb(var(--primary))] text-[rgb(var(--background))] duration-100',
        secondary:
          'bg-[rgb(var(--color-secondary-50))] font-[--font-roboto] text-[rgb(var(--primary))] duration-100',
      },
      size: {
        xs: 'pt-[var(--spacing-xs)] pb-[var(--spacing-xs)] pl-[var(--spacing-xs)] pr-[var(--spacing-xs)] text-[10px] rounded-[var(--rounded-m)]',
        sm: 'pt-[var(--spacing-xs)] pb-[var(--spacing-xs)] pl-[var(--spacing-m)] pr-[var(--spacing-m)] text-[16px] rounded-[var(--rounded-m)]',
        md: 'pt-[var(--spacing-x)] pb-[var(--spacing-x)] pl-[var(--spacing-m)] pr-[var(--spacing-m)] text-[19px] rounded-[var(--rounded-l)]'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {

  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, children, onClose, ...props }, ref) => {
    
    const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); 
      
      if (onClose) {
        onClose(e);
      }
    };

    return (
      <div
        className={cn(
          tagVariants({ variant, size, className }),
          {
            'cursor-pointer': !!props.onClick, 
          }
        )}
        ref={ref}
        {...props}
      >
        {children}

        {onClose && (
          <button
            type="button"
            aria-label="Remove tag" 
            onClick={handleCloseClick}
            className="
              -mr-2 ml-1 p-0.5 rounded-full 
              opacity-70 hover:opacity-100 
              hover:bg-black/10 dark:hover:bg-white/10
              transition-opacity
            "
          >
            <X className="size-[20px]" />
          </button>
        )}
      </div>
    );
  }
);
Tag.displayName = 'Tag';

export { Tag, tagVariants };