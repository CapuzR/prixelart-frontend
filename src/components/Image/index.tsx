import React from 'react';
import styles from './Styles.module.scss';

interface ImageProps {
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';  // Control how the image fits inside the container
  className?: string;        // For additional custom styling
  roundedCorner?: boolean;   // If true, the image will have rounded corners
  fitTo?: 'width' | 'height' | 'square' | 'full';// Control how the image fits inside the container
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
      className={`${styles['image-wrapper']} ${styles[`fit-to-${fitTo}`]} ${styles[objectFit]} ${styles[className]} ${roundedCorner ? styles['rounded'] : ''}`}
    >
      <img
        src={src}
        alt={alt}
        className={`${styles['image']} ${styles[`fit-to-${fitTo}`]} ${styles[objectFit]} ${className} ${roundedCorner ? styles['rounded'] : ''}`}
      />
    </div>
  );
};
