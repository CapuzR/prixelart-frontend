import React from 'react';
import styles from '../Styles.module.scss';
import { helpers } from '../helpers';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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




export const Track: React.FC<TrackProps> = ({
  children,
  currentIndex,
  speed,
  qtyPerSlide,
  spacing,
  dotsPosition,
  dots,
  useThumbnails }) => {
      const theme = useTheme();

  const flattenedChildren = React.Children.toArray(children);
  const numChildren = flattenedChildren.length;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  //  const isSlidingActive = numChildren > qtyPerSlide;
  const isSlidingActive = numChildren > qtyPerSlide;
  const slideWidthPercentage = isSlidingActive
    ? (100 / qtyPerSlide) // Normal sliding width
    : numChildren > 0 ? (100 / numChildren) : 100; // Distribute items evenly if not sliding, or 100% if 0 items (edge case)
  const trackWidthPercentage = isSlidingActive
    ? (numChildren / qtyPerSlide) * 100 // Normal track width calculation
    : 100; // Track fills container if not sliding

  return (
    <div
      className={`${styles['slider-container']}`}
    >
      <div
        className={`${styles['slider-wrapper']} ${styles[`spacing-${spacing}`]}`}
        style={{
          transform: isSlidingActive ? `translateX(-${currentIndex * (100 / qtyPerSlide)}%)` : 'translateX(0%)',
          transition: isSlidingActive ? `transform ${speed}ms ease-in-out` : 'none',
          maxHeight: '100%',
          width: `${trackWidthPercentage}%`,
          display: 'flex',
          gap: isMobile ? '0' : '1rem'
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
              className={`${styles['slider-slide']}`}
              style={{
                flexBasis: `${slideWidthPercentage}%`,
                maxWidth: `${slideWidthPercentage}%`,
                maxHeight: '100%',
                padding:
                  spacing === 'none'
                    ? '0'
                    : spacing === 'sm'
                      ? '0'
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
    </div >
  );
};
