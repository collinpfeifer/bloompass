import type { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  colorScheme: "dark",
  defaultGradient: {
    from: "#1b1d54",
    to: "#45fc8d",
    deg: 45,
  },
  breakpoints: {
    xs: "30em",
    sm: "48em",
    md: "64em",
    lg: "74em",
    xl: "90em",
  },
  respectReducedMotion: false,
  white: "#fff",
  black: "#000",
};
