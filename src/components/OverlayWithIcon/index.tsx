import React from 'react';
import styles from './styles.module.scss'; // Link to your SCSS file

interface OverlayWithIconProps {
  children: React.ReactNode;
  onClickLeft?: () => void; // Optional left icon click handler
  iconLeft?: JSX.Element; // Optional left icon
  iconRight?: JSX.Element; // Optional right icon
  onClickRight?: () => void; // Optional right icon click handler
  coverTarget?: 'children' | 'parent';
}

const OverlayWithIcon: React.FC<OverlayWithIconProps> = ({
  children,
  iconLeft,
  iconRight,
  onClickLeft,
  onClickRight,
  coverTarget = 'children',
}) => {
  return (
    <div
      className={`${styles['hover-overlay-container']} ${
        coverTarget === 'parent' ? styles['cover-parent'] : ''
      }`}
    >
      {children}
      <div className={styles['hover-overlay']}>
        <div className={styles['icon-container']}>
          {iconLeft && (
            <i className={`${styles.icon} ${styles['icon-left']}`} onClick={onClickLeft}>
              {iconLeft}
            </i>
          )}
          {iconLeft && iconRight && <div className={styles['separator']}></div>}
          {iconRight && (
            <i className={`${styles.icon} ${styles['icon-right']}`} onClick={onClickRight}>
              {iconRight}
            </i>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverlayWithIcon;
