import React, { useEffect, useState, useRef } from 'react';
import { Track } from './components/Track';
import { Controls } from './components/Controls';
import { helpers } from './helpers';
import { config } from './config';
import styles from './Styles.module.scss';
import { Indicators } from './components/Indicators';
import { UseIndicatorsType } from './interfaces';

interface SliderProps {
  children: React.ReactNode;
  images: { url: string; width?: string; height?: string }[];
  fitTo?: 'width' | 'height' | 'square' | 'variable';
  useIndicators?: UseIndicatorsType;
  childConfig?: {
    qtyPerSlide: number;
    spacing: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  };
  autoplay?: boolean;
  autoplaySpeed?: number;
  infinite?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  children,
  images = [],
  fitTo = 'square',
  useIndicators = {
    type: 'dots',
    position: 'over',
    color: { active: 'primary', inactive: 'tertiary' },
  },
  childConfig = { qtyPerSlide: 1, spacing: 'none' },
  autoplay = config.autoplay,
  autoplaySpeed = config.autoplaySpeed,
  infinite = config.infinite,
  speed = config.speed,
  pauseOnHover = config.pauseOnHover,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const quatityPerSlide = childConfig.qtyPerSlide > 1 ? childConfig.qtyPerSlide + 1 : 1;
  const dotsPerSlide = childConfig.qtyPerSlide - 1;

  const nextSlide =
    images.length > childConfig.qtyPerSlide
      ? helpers.nextSlide(currentIndex, images, setCurrentIndex, infinite, childConfig.qtyPerSlide)
      : () => {};
  const prevSlide =
    images.length > childConfig.qtyPerSlide
      ? helpers.prevSlide(currentIndex, images, setCurrentIndex, infinite, childConfig.qtyPerSlide)
      : () => {};

  const goToSlide = (index: number) => setCurrentIndex(index);

  const trackFormatClass = `${useIndicators && styles[`${useIndicators.position}-indicator-type-${useIndicators.type}-fit-to-${fitTo}`]}`;

  useEffect(() => {
    if (autoplay && images.length > childConfig.qtyPerSlide) {
      timeoutRef.current = setTimeout(nextSlide, autoplaySpeed);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [currentIndex, autoplay, autoplaySpeed, images.length, childConfig.qtyPerSlide]);

  return (
    <div
      className={`${styles['custom-slider']}`}
      ref={sliderRef}
      onMouseEnter={
        pauseOnHover ? () => timeoutRef.current && clearTimeout(timeoutRef.current) : undefined
      }
      onMouseLeave={
        pauseOnHover ? () => (timeoutRef.current = setTimeout(nextSlide, autoplaySpeed)) : undefined
      }
    >
      <Track
        currentIndex={currentIndex}
        speed={speed}
        qtyPerSlide={quatityPerSlide}
        spacing={childConfig.spacing}
        dotsPosition={(useIndicators && useIndicators.position) || 'over'}
        trackFormatClass={trackFormatClass}
      >
        {children}
      </Track>

      {images.length > childConfig.qtyPerSlide && (
        <>
          <Controls prevSlide={prevSlide} nextSlide={nextSlide} />

          {useIndicators && (
            <Indicators
              images={images}
              currentIndex={currentIndex}
              goToSlide={goToSlide}
              useIndicators={useIndicators}
              qtyPerSlide={dotsPerSlide}
            />
          )}
        </>
      )}
    </div>
  );
};
