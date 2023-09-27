import { red } from "@mui/material/colors";
import { createTheme, adaptV4Theme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme(
  adaptV4Theme({
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
  })
);

export default theme;
