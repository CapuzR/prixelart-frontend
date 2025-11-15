import { Alert } from "@mui/lab";
import Grid2 from "@mui/material/Grid";
import { useLocation } from 'react-router-dom';

import CurrencySwitch from "components/CurrencySwitch";
import Checkout from "@/checkout";
import CartGrid from "./Grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import styles from "./styles.module.scss";
import { useState } from "react";
import ScrollToTopButton from "@components/ScrollToTop";

const Cart = () => {
  const [checking, setChecking] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const fromPrixItem = location.state?.fromPrixItem;
  return (
    <Grid2 className={styles["main-container"]}>
      <div className={styles["alert-container"]}>
        <Alert severity="info">
          <strong>Importante:</strong> tus datos son 100% confidenciales y no
          serán compartidos con terceros
        </Alert>
      </div>
      <Grid2
        className={styles["content-row"]}
        style={checking ? { alignSelf: "center" } : {}}
        sx={{ padding: isMobile ? 0 : 10, gap: "2rem" }}
      >
        {isMobile ? (
          <Grid2>
            <Checkout checking={checking} setChecking={setChecking} fromPrixItem={fromPrixItem} />
          </Grid2>
        ) : (
          <>
            {!checking && <CartGrid checking={checking} />}
            <Grid2 style={{ maxWidth: checking ? "100%" : "600px" }}>
              <Checkout setChecking={setChecking} />
            </Grid2>
          </>
        )}
      </Grid2>
      <ScrollToTopButton />
    </Grid2>
  );
};

export default Cart;
