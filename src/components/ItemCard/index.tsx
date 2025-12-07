import styles from "./styles.module.scss";
import ItemPlayground from "components/ItemPlayground";
import ItemContent from "components/ItemContent";
// import Typography from "components/Typography"
import { formatNumberString, formatSinglePrice } from "utils/formats";
import { useConversionRate, useCurrency } from "context/GlobalContext";
import { CartLine } from "../../types/cart.types";
import { Item } from "types/order.types";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Grid2 from "@mui/material/Grid";
import { Typography } from "@mui/material";
export interface ItemCardProps {
  item: Item;
  direction?: "row" | "column";
  handleChangeElement?: (
    type: "producto" | "arte",
    item: Item,
    lineId?: string,
  ) => void;
  line?: CartLine;
}

export default function ItemCard({
  item,
  direction = "row",
  handleChangeElement,
  line,
}: ItemCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  let finalPriceStrToFormat: string | null | undefined = item.price;
  let originalPriceStrToFormat: string | null | undefined = undefined;
  if (
    item.discount &&
    item.discount > 0 &&
    item.price &&
    item.price !== "Error"
  ) {
    const originalPriceNum = formatNumberString(item.price);

    if (!isNaN(originalPriceNum)) {
      const discountMultiplier = 1 - item.discount / 100;
      const finalPriceNum = originalPriceNum * discountMultiplier;
      finalPriceStrToFormat = finalPriceNum.toString();
      originalPriceStrToFormat = item.price;
    } else {
      finalPriceStrToFormat = "Error";
      originalPriceStrToFormat = undefined;
    }
  }

  const formattedPriceHtml = formatSinglePrice(
    finalPriceStrToFormat,
    currency,
    conversionRate,
    originalPriceStrToFormat,
  );

  return (
    <Grid2
      container
      size={{ xs: 12 }}
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "1rem",
        flexWrap: "unset",
        alignItems: "center",
      }}
    >
      <Grid2 size={{ sm: 12 }} className={styles["item-playground"]}>
        <ItemPlayground
          item={item}
          handleChangeElement={handleChangeElement}
          line={line}
        />
      </Grid2>
      <Grid2
        size={{ sm: 12 }}
        className={styles["item-content"]}
        sx={{ height: "auto", flex: "content" }}
      >
        <ItemContent
          item={item}
          direction={direction === "row" ? "column" : "row"}
        />
        {item.product && (
          <Grid2
            className={`${styles["pricing-info"]} ${direction === "column" && styles["extra-padding"]}`}
            sx={{ marginTop: isMobile ? 0 : "1rem" }}
          >
            {isMobile && (
              <Grid2
                className={`${styles["unit-price"]}`}
                sx={{
                  display: "flex",
                  flexDirection: "row !important",
                  gap: "0.5rem",
                  padding: "1rem 0 0 !important",
                  justifyContent: "left",
                }}
              >
                <Typography
                  sx={{ fontWeight: "bold" }}
                  variant={isMobile ? "subtitle2" : "h5"}
                  style={{ fontSize: isMobile ? '12px' : '24px'}}
                >
                  Unitario:
                </Typography>
                <Typography
                  variant={isMobile ? "subtitle2" : "h5"}
                  style={{ fontSize: isMobile ? '12px' : '24px'}}
                  dangerouslySetInnerHTML={{ __html: formattedPriceHtml }}
                />
              </Grid2>
            )}
          </Grid2>
        )}
      </Grid2>
      {!isMobile && (
        <Grid2
          padding={2}
          className={`${styles["unit-price"]}`}
          sx={{
            flexDirection: "column",
            gap: "0.8rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            sx={{ fontWeight: "bold" }}
            variant={isMobile ? "subtitle2" : "h5"}
          >
            Unitario:
          </Typography>
          <Typography
            variant={isMobile ? "subtitle2" : "h5"}
            dangerouslySetInnerHTML={{ __html: formattedPriceHtml }}
          />
        </Grid2>
      )}
    </Grid2>
  );
}
