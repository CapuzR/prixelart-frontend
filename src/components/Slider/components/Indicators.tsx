import React from 'react';
import { Dots } from './Dots';
import { Thumbnails } from './Thumbnails';
import styles from '../Styles.module.scss';
import { UseIndicatorsType } from '../interfaces';

interface IndicatorsProps {
  images: { url: string }[];
  currentIndex: number;
  goToSlide: (index: number) => void;
  useIndicators?: UseIndicatorsType;
  totalImages: number; // Already suggested in point 1
  itemsPerSlide: number; // Already suggested in point 1
}

export const Indicators: React.FC<IndicatorsProps> = ({
  images, // Keep for thumbnails
  currentIndex,
  goToSlide,
  useIndicators,
  totalImages,
  itemsPerSlide,
}) => {
  const isBelow = useIndicators && useIndicators.position === 'below';

  // Calculate the number of distinct slide starting positions (pages)
  const numPages = totalImages > itemsPerSlide ? totalImages - itemsPerSlide + 1 : 1;

  return (
    <div
      className={`${isBelow ? styles['below-indicator'] : styles['over-indicator']}`}
      style={{ minHeight: '20px' }} // Keep styling 
    >
      {/* Only render indicators if there's more than one page */}
      {numPages > 1 && useIndicators && useIndicators.type === 'dots' ? (
        <Dots
          total={numPages} // Directly use the calculated number of pages/dots
          currentIndex={currentIndex}
          goToSlide={goToSlide}
          useIndicators={useIndicators}
        />
      ) : numPages > 1 && useIndicators && useIndicators.type === 'thumbnails' ? (
        <Thumbnails images={images} currentIndex={currentIndex} goToSlide={goToSlide} />
      ) : null /* Render nothing if only one page */}
    </div>
  );
};