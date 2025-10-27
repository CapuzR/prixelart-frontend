import React, { useEffect } from 'react';
import { useBackdrop } from '@context/UIContext';
import styles from './styles.module.scss';

interface BackdropProps {
  disableCloseOnClick?: boolean;
  disableAutoClose?: boolean;
  autoCloseAfter?: number; // Time in milliseconds, defaults to 10 seconds if not provided
}

const Backdrop: React.FC<BackdropProps> = ({
  disableCloseOnClick = false,
  disableAutoClose = false,
  autoCloseAfter = 10000, // Default to 10 seconds
}) => {
  const { backdropOpen, closeBackdrop } = useBackdrop();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (backdropOpen && !disableAutoClose) {
      timer = setTimeout(() => {
        closeBackdrop();
      }, autoCloseAfter);
    }

    // Clear the timer when the backdrop is closed or component is unmounted
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [backdropOpen, disableAutoClose, autoCloseAfter, closeBackdrop]);

  const handleClick = () => {
    if (!disableCloseOnClick) {
      closeBackdrop();
    }
  };

  return (
    <div
      className={`${styles.backdrop} ${backdropOpen ? styles.visible : ''}`}
      onClick={handleClick} // Only closes if disableCloseOnClick is false
    />
  );
};

export default Backdrop;
