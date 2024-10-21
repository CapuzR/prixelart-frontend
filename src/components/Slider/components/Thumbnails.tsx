import React from 'react';
import styles from '../Styles.module.scss';// Ensure this points to your SCSS file

interface ThumbnailsProps {
  images: { url: string }[];
  currentIndex: number;
  goToSlide: (index: number) => void;
}

export const Thumbnails: React.FC<ThumbnailsProps> = ({ images, currentIndex, goToSlide }) => (
  <div className={`${styles["slider-dots"]}`}>
    {images?.map((image, index) => (
      <img
        key={index}
        src={image.url}
        alt={`Thumbnail ${index}`}
        className={`${styles["slider-thumbnail"]} ${index === currentIndex ? styles["active"] : ""}`}
        onClick={() => goToSlide(index)}
      />
    ))}
  </div>
);
