import { red } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core/styles";

// A custom theme for this app
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
  },
});

export default theme;
