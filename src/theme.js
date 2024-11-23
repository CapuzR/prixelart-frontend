import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#d33f49",
    },
    secondary: {
      main: "#404e5c",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
    spacing: 8,
  },
});

export default theme;