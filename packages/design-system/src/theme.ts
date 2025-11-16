import { createTheme } from "@mui/material/styles";
import { colors, spacing } from "@prixpon/tokens/tokens";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.brand.main,
    },
    secondary: {
      main: colors.secondary.greyPrix600,
    },
    error: {
      main: colors.error.text,
    },
    background: {
      default: colors.background.light,
    },
  },
  spacing: spacing.XS,
});

export default theme;