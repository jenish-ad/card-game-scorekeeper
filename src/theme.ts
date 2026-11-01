export const lightColors = {
  bg: '#F6F5F4',
  surface: '#FFFFFF',
  surfaceAlt: '#ECE9E7',
  border: '#C5BFBB',
  primary: '#9C2333',
  primaryTint: '#F6E5E7',
  text: '#252121',
  textMuted: '#605554',
  gain: '#17603B',
  loss: '#AD2938',
  zero: '#605554',
  onPrimary: '#FFFFFF',
  avatar: '#EDD1D5',
};
export const darkColors: typeof lightColors = {
  bg: '#181516',
  surface: '#211C1D',
  surfaceAlt: '#30282A',
  border: '#756166',
  primary: '#FFB1BB',
  primaryTint: '#42272E',
  text: '#F6F0F1',
  textMuted: '#CEBEC1',
  gain: '#7EDAA7',
  loss: '#FFA2AC',
  zero: '#CEBEC1',
  onPrimary: '#37131A',
  avatar: '#5A343D',
};
const foundations = {
  radius: { card: 12, button: 10, chip: 6, mark: 6 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  fonts: {
    title: 'Manrope_700Bold',
    body: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    bold: 'Manrope_700Bold',
  },
  touchTarget: 44,
  buttonHeight: 48,
  motion: { quick: 160, enter: 260 },
} as const;
export const lightTheme = { ...foundations, colors: lightColors };
export const darkTheme = { ...foundations, colors: darkColors };
export type AppTheme = typeof lightTheme;
