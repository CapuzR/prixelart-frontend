import React from 'react';
import styles from '../Styles.module.scss';
import { helpers } from '../helpers';

interface TrackProps {
  children: React.ReactNode;
  currentIndex: number;
  speed: number;
  qtyPerSlide: number;
  spacing: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  dotsPosition: 'over' | 'below';
  dots?: boolean;
  useThumbnails?: boolean;
  trackFormatClass?: string;
}
//Pending: Check if the user is seeing this to move the slider, if not, the slider will not move.
export const Track: React.FC<TrackProps> = ({
  children,
  currentIndex,
  speed,
  qtyPerSlide,
  spacing,
  dotsPosition,
  dots,
  useThumbnails,
  trackFormatClass,
}) => {
  const flattenedChildren = React.Children.toArray(children);

  return (
    <div
      className={`${styles['slider-container']} ${styles[dotsPosition]} ${trackFormatClass && styles[trackFormatClass]}`}
    >
      <div
        className={`${styles['slider-wrapper']} ${styles[`spacing-${spacing}`]}`}
        style={{
          transform: `translateX(-${currentIndex * (100 / qtyPerSlide)}%)`,
          transition: `transform ${speed}ms ease-in-out`,
          maxHeight: '100%',
          width: `${(flattenedChildren.length / qtyPerSlide) * 100}%`, // Adjust width
          display: 'flex',
        }}
      >
        {flattenedChildren.map((child, index) => {
          if (!React.isValidElement(child)) {
            console.error('Invalid React Element:', child);
            return null;
          }

          return (
            <div
              key={index}
              className={`${styles['slider-slide']} ${dots && dotsPosition === 'below' && styles['dots-below']} ${useThumbnails && dotsPosition === 'below' && styles['thumbnails-below']}`}
              style={{
                // flex: `0 0 calc(${100 / qtyPerSlide}%)`,
                // maxWidth: `${100 / qtyPerSlide}%`,
                maxWidth: `${100 / qtyPerSlide}%`,
                maxHeight: '100%',
                padding:
                  spacing === 'none'
                    ? '0'
                    : spacing === 'sm'
                      ? '5px'
                      : spacing === 'md'
                        ? '10px'
                        : '15px',
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};
