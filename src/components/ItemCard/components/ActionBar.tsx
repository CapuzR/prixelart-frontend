import React from 'react';
import styles from './ActionBar.module.scss';

interface ActionBarProps {
    onUpperAction?: () => void;
    onLowerAction?: () => void;
    upperIcon: React.ReactNode;
    lowerIcon: React.ReactNode;
}

const ActionBar: React.FC<ActionBarProps> = ({
    onUpperAction,
    onLowerAction,
    upperIcon,
    lowerIcon,
}) => {
  return (
    <div className={styles['action-bar']}>
      <div className={styles['icon-wrapper']} onClick={onUpperAction}>
        {upperIcon}
      </div>
      <div className={styles['icon-wrapper']} onClick={onLowerAction}>
        {lowerIcon}
      </div>
    </div>
  );
};

export default ActionBar;
