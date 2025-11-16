import { FC, useEffect, useState, useCallback } from "react";
import styles from "./SnackBar.module.scss";

interface SnackbarProps {
  open: boolean;
  message: string;
  onClose?: () => void;
}

const Snackbar: FC<SnackbarProps> = ({ open, message, onClose }) => {
  // const [visible, setVisible] = useState(true);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className={styles.snackbar}>
      <div className={styles["snackbar-content"]}>{message}</div>
    </div>
  );
};

export default Snackbar;
