import React from "react";
import styles from "../Styles.module.scss";

interface ControlsProps {
  prevSlide: () => void;
  nextSlide: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ prevSlide, nextSlide }) => (
  <>
    <button
      className={`${styles["slider-arrow"]} ${styles["slider-arrow-left"]}`}
      onClick={prevSlide}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="48"
        height="48"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6"></path>
      </svg>
    </button>
    <button
      className={`${styles["slider-arrow"]} ${styles["slider-arrow-right"]}`}
      onClick={nextSlide}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="48"
        height="48"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6"></path>
      </svg>
    </button>
  </>
);
