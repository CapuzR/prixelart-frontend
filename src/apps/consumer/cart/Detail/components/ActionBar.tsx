import React from 'react';
import styles from './ActionBar.module.scss';

type OnlyUpperProps = {
  onUpperAction: (() => void) | undefined;
  upperIcon: React.ReactNode;
  onLowerAction?: never;
  lowerIcon?: never;
};

type OnlyLowerProps = {
  onLowerAction: (() => void) | undefined;
  lowerIcon: React.ReactNode;
  onUpperAction?: never;
  upperIcon?: never;
};

type BothActionsProps = {
  onUpperAction: () => void;
  upperIcon: React.ReactNode;
  onLowerAction: () => void;
  lowerIcon: React.ReactNode;
};

type ActionBarProps = OnlyUpperProps | OnlyLowerProps | BothActionsProps;

const ActionBar: React.FC<ActionBarProps> = ({
  onUpperAction,
  onLowerAction,
  upperIcon,
  lowerIcon,
}) => {
  return (
    <div className={styles['action-bar']}>
      {onUpperAction && upperIcon && (
        <div className={styles['icon-wrapper']} onClick={onUpperAction}>
          {upperIcon}
        </div>
      )}
      {onLowerAction && lowerIcon && (
        <div className={styles['icon-wrapper']} onClick={onLowerAction}>
          {lowerIcon}
        </div>
      )}
    </div>
  );
};

export default ActionBar;
