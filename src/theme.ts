import { createTheme } from '@mui/material/styles';
import { colors, radii, fonts, spacing } from './styles/tokens';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.brand.main,
    },
    secondary: {
      main: '#404e5c',
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
