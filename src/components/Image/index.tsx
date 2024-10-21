import React from 'react';
import styles from './Styles.module.scss';

interface ImageProps {
  src: string;
  alt?: string;
  aspectRatio?: 'square' | 'vertical' | 'horizontal'; // Control aspect ratio
  width?: string | number;   // Accepts percentages, px, rem, etc.
  height?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill';  // Control how the image fits inside the container
  borderRadius?: string;     // Optional border radius (can be a class in SCSS as well)
  boxShadow?: string;        // Optional shadow (can be a class in SCSS as well)
  className?: string;        // For additional custom styling
  fitHeight?: boolean;       // If true, the height will be set to auto
  roundedCorner?: boolean;   // If true, the image will have rounded corners
  fitTo?: 'width' | 'height';// Control how the image fits inside the container
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = 'image',
  objectFit = 'cover',
  className = '',
  roundedCorner = true,
  fitTo = 'square',
}) => {
  
  return (
    <div
      className={`${styles['image-wrapper']} ${styles[className]} ${roundedCorner ? styles['rounded'] : ''} ${styles[`fit-to-${fitTo}`]}`}
    >
      <img
        src={src}
        alt={alt}
        className={`
          ${styles['image']}
        `}
        style={{
          objectFit
        }}
      />
    </div>
  );
};
