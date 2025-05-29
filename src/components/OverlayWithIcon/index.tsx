import React, { JSX } from "react"
import styles from "./styles.module.scss"

interface BaseOverlayProps {
  children: React.ReactNode
  coverTarget?: "children" | "parent"
}

type OnlyLeftProps = {
  onClickLeft: () => void
  iconLeft: JSX.Element
  onClickRight?: never
  iconRight?: never
}

type OnlyRightProps = {
  onClickRight: () => void
  iconRight: JSX.Element
  onClickLeft?: never
  iconLeft?: never
}

type BothActionsProps = {
  onClickLeft: () => void
  iconLeft: JSX.Element
  onClickRight: () => void
  iconRight: JSX.Element
}

type OverlayWithIconProps = BaseOverlayProps &
  (OnlyLeftProps | OnlyRightProps | BothActionsProps)

const OverlayWithIcon: React.FC<OverlayWithIconProps> = ({
  children,
  coverTarget = "children",
  onClickLeft,
  iconLeft,
  onClickRight,
  iconRight,
}) => {
  return (
    <div
      style={{ display: "flex", alignContent: 'center', backgroundColor: 'gainsboro'}}
      className={`${styles["hover-overlay-container"]} ${
        coverTarget === "parent" ? styles["cover-parent"] : ""
      }`}
    >
      {children}
      <div className={styles["hover-overlay"]}>
        <div className={styles["icon-container"]}>
          {iconLeft && (
            <i
              className={`${styles.icon} ${styles["icon-left"]}`}
              onClick={onClickLeft}
            >
              {iconLeft}
            </i>
          )}
          {iconLeft && iconRight && <div className={styles["separator"]}></div>}
          {iconRight && (
            <i
              className={`${styles.icon} ${styles["icon-right"]}`}
              onClick={onClickRight}
            >
              {iconRight}
            </i>
          )}
        </div>
      </div>
    </div>
  )
}

export default OverlayWithIcon
