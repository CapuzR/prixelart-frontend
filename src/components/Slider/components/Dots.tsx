import React from 'react';
import styles from '../Styles.module.scss';
import { UseIndicatorsType } from '../interfaces';

interface DotsProps {
  total: number;
  currentIndex: number;
  goToSlide: (index: number) => void;
  useIndicators?: UseIndicatorsType;
}

export const Dots: React.FC<DotsProps> = ({
  total,
  currentIndex,
  goToSlide,
  useIndicators = {
    type: 'dots',
    position: 'over',
    color: { active: 'primary', inactive: 'tertiary' },
  },
}) => (
  <div className={`${styles['slider-dots']}`}>
    {Array.from({ length: total })?.map((_, index) => (
      <button
        key={index}
        className={`
          ${styles['slider-dot']}
          ${
            index === currentIndex
              ? `${styles[`active-${useIndicators && useIndicators?.color?.active}`]}`
              : `${styles[`inactive-${useIndicators && useIndicators?.color?.inactive}`]}`
          }
        `}
        onClick={() => goToSlide(index)}
      />
    ))}
  </div>
);
