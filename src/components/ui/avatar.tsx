import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const getInitials = (name: string = "") => {
  const parts = name.replace(/\./g, ' ').split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarSizeVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        default: 'size-(--spacing-m)',
        sm: 'h-8 w-8',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement | HTMLSpanElement>,
    VariantProps<typeof avatarSizeVariants> {
  
  src: string;
  text?: string;
}

const Avatar = React.forwardRef<
  HTMLDivElement | HTMLSpanElement,
  AvatarProps
>(
  ({ src, text, size, className, ...props }, ref) => {
    
    const initials = getInitials(text);
    const altText = text || "User avatar";

    const textSizeClasses = 
      size === 'sm' ? 'text-[length:var(--spacing-x)]' 
      : size === 'lg' ? 'text-lg'
      : 'text-[length:var(--spacing-x)]';

      const AvatarComponent = (
      <AvatarPrimitive.Root
        ref={!text ? (ref as React.Ref<HTMLSpanElement>) : undefined}
        className={cn(avatarSizeVariants({ size }), {
          [className as string]: !text,
        })}
        {...(!text ? props : {})}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={altText}
          className="aspect-square size-(--spacing-m)"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            'flex width-(<--spacing-m>) items-center justify-center rounded-full',
            'bg-[rgb(var(--muted))] text-[rgb(var(-))]',
          )}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );

    if (text) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(
            'flex items-center',
            className
          )}
          {...props}
        >
          {AvatarComponent}
          
          <span className={cn('ml-[var(--spacing-xxs)] text-[rgb(var(--color-secondary-500))]', textSizeClasses)}>
            {text}
          </span>
        </div>
      );
    }
    
    return AvatarComponent;
  }
);
Avatar.displayName = 'Avatar';

export { Avatar, avatarSizeVariants };