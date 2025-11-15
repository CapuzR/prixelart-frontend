import styles from "./styles.module.scss";
import { Image } from "components/Image";
import AddImage from "components/AddImage";
import OverlayWithIcon from "components/OverlayWithIcon";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { CartLine } from "../../types/cart.types";
import { Item } from "types/order.types";
import Grid2 from "@mui/material/Grid";

export interface ItemPlaygroundProps {
  item: Item;
  handleChangeElement?: (
    type: "producto" | "arte",
    item: Item,
    lineId?: string,
  ) => void;
  line?: CartLine;
}

export default function ItemPlayground({
  item,
  handleChangeElement,
  line,
}: ItemPlaygroundProps) {
  return (
    <Grid2 className={styles["container"]} sx={{ alignItems: "center" }}>
      {/* {item?.product?.mockUp ? (
        <Grid2 className={styles['warp-container']}></Grid2>
      ) : ( */}
      <Grid2 className={styles["sel-container"]} sx={{ gap: "1rem" }}>
        <Grid2 className={styles["product-area"]}>
          {item?.product ? (
            <OverlayWithIcon
              iconLeft={<AutorenewIcon />}
              coverTarget="parent"
              onClickLeft={() =>
                handleChangeElement!(
                  "producto",
                  item,
                  line ? line.id : undefined,
                )
              }
            >
              <Image
                src={item?.product?.sources?.images[0]?.url}
                alt={item?.product?.name}
                objectFit="cover"
              />
            </OverlayWithIcon>
          ) : (
            <AddImage />
          )}
        </Grid2>
        <Grid2 className={styles["art-area"]}>
          {item?.art ? (
            <OverlayWithIcon
              iconLeft={<AutorenewIcon />}
              coverTarget="parent"
              onClickLeft={() =>
                handleChangeElement!("arte", item, line ? line.id : undefined)
              }
            >
              <Image
                src={
                  "largeThumbUrl" in item.art
                    ? item.art.largeThumbUrl
                    : item.art.url
                }
                alt={item.art?.title}
                objectFit="contain"
              />
            </OverlayWithIcon>
          ) : (
            <AddImage />
          )}
        </Grid2>
      </Grid2>
      {/* )
      } */}
    </Grid2>
  );
}
