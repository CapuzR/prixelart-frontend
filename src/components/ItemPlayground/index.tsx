import { Item } from "./interfaces"
import styles from "./styles.module.scss"
import { Image } from "components/Image"
import AddImage from "components/AddImage"
import OverlayWithIcon from "components/OverlayWithIcon"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import DeleteIcon from "@mui/icons-material/Delete"

export interface ItemPlaygroundProps {
  item: Item
  handleChangeElement?: (type: "producto" | "arte", item: Item) => void
}

export default function ItemPlayground({
  item,
  handleChangeElement,
}: ItemPlaygroundProps) {
  return (
    <div className={styles["container"]}>
      {item?.product?.mockUp ? (
        <div className={styles["warp-container"]}></div>
      ) : (
        <div className={styles["sel-container"]}>
          <div className={styles["product-area"]}>
            {item?.product ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                coverTarget="parent"
                onClickLeft={() => handleChangeElement!("producto", item)}
              >
                {item?.product?.sources?.images && (
                  <Image
                    src={item?.product?.sources?.images?.[0]?.url}
                    alt={item?.product?.name}
                    fitTo="width"
                    objectFit="cover"
                  />
                )}
              </OverlayWithIcon>
            ) : (
              <AddImage />
            )}
          </div>
          <div className={styles["art-area"]}>
            {item?.art ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                coverTarget="parent"
                onClickLeft={() => handleChangeElement!("arte", item)}
              >
                <Image
                  src={item.art?.largeThumbUrl}
                  alt={item.art?.title}
                  fitTo="width"
                  objectFit="contain"
                />
              </OverlayWithIcon>
            ) : (
              <AddImage />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
