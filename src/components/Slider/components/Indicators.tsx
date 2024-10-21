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
  qtyPerSlide: number;
}

export const Indicators: React.FC<IndicatorsProps> = (
  { 
    images, 
    currentIndex, 
    goToSlide, 
    useIndicators = { 
      type: 'dots', 
      position: 'over', 
      color: { active: 'primary', inactive: 'tertiary' }
    },
    qtyPerSlide,
  }
) => {
  const isBelow = useIndicators && useIndicators.position === 'below';
  
  return (
    <div
      className={`${isBelow ? styles['below-indicator'] : styles['over-indicator']}`}
      style={{
        position: isBelow ? 'relative' : 'absolute',
        bottom: isBelow ? 'auto' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {useIndicators && useIndicators.type === 'dots' ? (
        <Dots total={images.length-qtyPerSlide} currentIndex={currentIndex} goToSlide={goToSlide} useIndicators={useIndicators} />
      ) : (
        <Thumbnails images={images} currentIndex={currentIndex} goToSlide={goToSlide} />
      )}
    </div>
  );
};
