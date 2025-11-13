const primary = {
  redPrix50: 'rgba(254, 243, 242, 1)',
  redPrix100: 'rgba(252, 233, 231, 1)',
  redPrix200: 'rgba(249, 211, 210, 1)',
  redPrix300: 'rgba(244, 175, 173, 1)',
  redPrix400: 'rgba(237, 128, 127, 1)',
  redPrix500: 'rgba(226, 81, 84, 1)',
  redPrix600: 'rgba(210, 63, 73, 1)', // main
  redPrix700: 'rgba(173, 35, 48, 1)',
  redPrix800: 'rgba(145, 32, 46, 1)',
  redPrix900: 'rgba(145, 32, 46, 1)',
  redPrix950: 'rgba(69, 12, 19, 1)',
};

const secondary = {
  greyPrix50: 'rgba(245, 246, 246, 1)',
  greyPrix5030: 'rgba(245, 246, 246, 0.3)',
  greyPrix5050: 'rgba(245, 246, 246, 0.5)',
  greyPrix100: 'rgba(228, 230, 233, 1)',
  greyPrix200: 'rgba(204, 208, 213, 1)',
  greyPrix300: 'rgba(169, 175, 183, 1)',
  greyPrix400: 'rgba(127, 135, 145, 1)',
  greyPrix500: 'rgba(99, 107, 119, 1)',
  greyPrix600: 'rgba(86, 92, 102, 1)', // main
  greyPrix60030: 'rgba(86, 92, 102, 0.3)',
  greyPrix700: 'rgba(73, 77, 85, 1)',
  greyPrix800: 'rgba(65, 68, 73, 1)',
  greyPrix900: 'rgba(57, 59, 64, 1)',
  greyPrix950: 'rgba(35, 36, 41, 1)',
};

export const sizes = {
  size000: 0,
  size004: 4,
  size008: 8,
  size014: 14,
  size016: 16,
  size024: 24,
  size032: 32,
  size040: 40,
  size048: 48,
  size056: 56,
  size064: 64,
  size072: 72,
  size080: 80,
  size088: 88,
  size096: 96,
  size104: 104,
  size112: 112,
  size120: 120,
  size128: 128,
};

export const strokes = {
    s: 1,
    m: 2,
    l: 4,
    xl: 6,
    xxl: 8,
    xxxl: 10,
    xxxxl: 12
}

export const colors = {
  primary: primary,
  secondary: secondary,
  error: {
    base: 'rgba(251, 55, 72, 0.1)',
    text: 'rgba(208, 4, 22, 1)',
  },
  warning: {
    base: 'rgba(255, 219, 67, 0.1)',
    text: 'rgba(255, 219, 67, 1)',
  },
  success: {
    base: 'rgba(31, 193, 107, 0.1)',
    text: 'rgba(31, 193, 107, 1)',
  },
  brand: {
    main: primary.redPrix600,
    light: primary.redPrix400,
    lighter: primary.redPrix200,
    dark: primary.redPrix700,
    darker: primary.redPrix800,
  },
  background: {
    light: 'rgba(255, 255, 255, 1)',
    dark: secondary.greyPrix600,
  },
  btn: {
    main: primary.redPrix600,
    hover: primary.redPrix700,
    select: primary.redPrix700,
    strokeSelect: primary.redPrix600,
    secondary: secondary.greyPrix50,
    // secondaryHover: primary.redPrix700,
    back: secondary.greyPrix50,
    card: secondary.greyPrix5050,
    disabled: secondary.greyPrix5030,
    backHover: secondary.greyPrix100,
    backSelect: secondary.greyPrix5050,
    primaryText: secondary.greyPrix50,
    secondaryText: primary.redPrix600,
  },
  tags: {
    text: primary.redPrix500,
    base: secondary.greyPrix50,
  },
  text: {
    header: secondary.greyPrix600,
    disabled: secondary.greyPrix60030,
    description: secondary.greyPrix500,
  },
  icons: {
    active: primary.redPrix600,
    searchBar: primary.redPrix600,
    input: secondary.greyPrix400,
    disabled: secondary.greyPrix300,
    secondary: secondary.greyPrix50,
  },
};

export const radii = {
  //   sm: '4px',
  M: sizes.size004,
  L: sizes.size008,
  XL: sizes.size016,
};

export const spacing = {
  Zero: sizes.size000,
  XXS: sizes.size004,
  XS: sizes.size008,
  X: sizes.size014,
  S: sizes.size016,
  M: sizes.size024,
  L: sizes.size032,
  XL: sizes.size040,
  XXL: sizes.size048,
  XXXL: sizes.size056,
  XXXXL: sizes.size064,
};

export const fonts = {
  sans: '"Roboto", "Helvetica", "Arial", sans-serif',
  mono: '"Roboto Mono", "Courier New", monospace',
};