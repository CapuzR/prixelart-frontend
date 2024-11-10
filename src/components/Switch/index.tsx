import React from 'react';
import styles from './styles.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  leftLabel = '',
  rightLabel = '',
  className = '',
}) => {
  return (
    <div className={`${styles['switch']} ${className}`} onClick={onChange}>
      <div className={styles['track']}>
        <span
          className={`${styles['label']} ${styles['left']} ${!checked ? styles['active'] : ''}`}
        >
          {leftLabel}
        </span>
        <span
          className={`${styles['label']} ${styles['right']} ${checked ? styles['active'] : ''}`}
        >
          {rightLabel}
        </span>
        <span className={`${styles['thumb']} ${checked ? styles['thumbRight'] : ''}`} />
      </div>
    </div>
  );
};

export default Switch;
