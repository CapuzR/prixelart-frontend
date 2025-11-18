import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tag } from './tag';
import { Avatar } from './avatar';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-l)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))]',
        'shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 border-0', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-(length:--spacing-m) text-[var(--color-secondary-600)] font-[--font-roboto] font-bold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[var(--spacing-s)] m-[0px] p-0 text-[rgb(var(--color-secondary-500))]',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-[var(--spacing-m)] pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-[var(--spacing-m)] pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

interface BaseCardProps {
  imageUrl: string;
  priceTag?: string;
  title: string;
  sub?: string;
  description: string;
  tags?: string[];
  author?: {
    name: string;
    avatarUrl: string;
  };
  className?: string;
  onClick?: () => void;
}

function BaseCard({
  imageUrl,
  priceTag,
  title,
  sub,
  description,
  tags,
  author,
  className,
  ...props
}: BaseCardProps) {
  return (
    <Card
      className={cn(
        'w-auto max-w-sm flex flex-col rounded-[var(--spacing-s)] pt-[var(--spacing-xs)] pl-[10px] pr-[10px] pb-[12px] shadow-(--subtle) ',
        className
      )}
      {...props}
    >
      <CardHeader className="mb-[var(--spacing-s)]">
        <img
          src={imageUrl}
          alt={title}
          className="w-auto aspect-[1/1.1] object-cover rounded-[var(--stroke-xxxxl)] mb-[var(--spacing-s)]"
        />

        <CardTitle className="mb-[var(--spacing-s)] mt-[0px]">{title}</CardTitle>
        {sub && <CardTitle className="mt-[-16px] mb-[0px] text-[length:var(--spacing-s)] text-[rgb(var(--color-primary-700))]">{sub}</CardTitle>}

        {priceTag && (
          <Tag size="xs" className=" size-fit text-[16px]">
            ${priceTag}
          </Tag>
        )}
      </CardHeader>

      <CardContent className="flex-grow p-0">
        <CardDescription>{description}</CardDescription>
      </CardContent>

      {(tags !== undefined || author !== undefined) && (
        <CardFooter className="flex-col items-start p-[0px] gap-[var(--spacing-s)] mt-[var(--spacing-xs)]">
          {tags !== undefined && (
            <div className="flex flex-wrap gap-[var(--spacing-xs)]">
              {tags.map((tag: string) => (
                <Tag key={tag} size="xs" variant="secondary">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {author !== undefined && <Avatar src={author.avatarUrl} text={author.name} size="sm" />}
        </CardFooter>
      )}
    </Card>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, BaseCard };
