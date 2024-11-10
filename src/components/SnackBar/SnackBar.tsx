import React, { FC, useEffect, useState, useCallback } from 'react';
import styles from './SnackBar.module.scss';

interface SnackbarProps {
  message: string;
  onClose?: () => void;
}

const Snackbar: FC<SnackbarProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [handleClose]);

  if (!visible) return null;

  return (
    <div className={styles.snackbar}>
      <div className={styles['snackbar-content']}>{message}</div>
    </div>
  );
};

export default Snackbar;
