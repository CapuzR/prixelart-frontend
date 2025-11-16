import { Item } from "@prixpon/types/order.types";
import styles from "./styles.module.scss";
import { Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export interface ItemContentProps {
  item: Item;
  direction?: "row" | "column";
}

export default function ItemContent({
  item,
  direction = "row",
}: ItemContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getSelectedAttributes = () => {
    return (item.product?.selection || [])
      .slice(0, 3)
      .filter((attr) => attr.value !== "")
      .map((attr, index) => (
        <Typography key={index} variant={isMobile ? "subtitle2" : "h5"}>
          <strong>{attr.name}</strong>: {attr.value}
        </Typography>
      ));
  };

  return (
    <Grid2
      container
      className={`${styles["content-section"]} ${styles[direction]}`}
      spacing={5}
      sx={{ flexDirection: isMobile ? "column" : "row", gap: "1rem" }}
    >
      <Grid2
        size={{ xs: 12 }}
        className={`${styles["product-section"]} ${direction === "row" && styles["paper"]}`}
      >
        <Typography variant={isMobile ? "subtitle2" : "h5"} color="inherit">
          <strong>Producto:</strong> {item.product?.name || "Elígelo"}
        </Typography>
        {getSelectedAttributes()}
      </Grid2>

      <Grid2
        size={{ xs: 12 }}
        className={`${styles["art-section"]} ${direction === "row" && styles["paper"]}`}
      >
        <Typography variant={isMobile ? "subtitle2" : "h5"} color="inherit">
          <strong>Arte:</strong> {item.art?.title || "Selecciónalo"}
        </Typography>
        {item.art?.title && item.art?.prixerUsername && (
          <Typography variant={isMobile ? "subtitle2" : "h5"}>
            <strong>Prixer:</strong> {item.art?.prixerUsername}
          </Typography>
        )}
      </Grid2>
    </Grid2>
  );
}
