export const lightColors = {
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#E9EDF2',
  border: '#B9C2CE',
  primary: '#244F91',
  primaryTint: '#E1EAF8',
  text: '#18212F',
  textMuted: '#4C596B',
  gain: '#17603B',
  loss: '#AD2938',
  zero: '#4C596B',
  onPrimary: '#FFFFFF',
  avatar: '#CBD9EE',
};
export const darkColors: typeof lightColors = {
  bg: '#10151D',
  surface: '#19212C',
  surfaceAlt: '#242F3F',
  border: '#56657A',
  primary: '#A8C9FF',
  primaryTint: '#263B59',
  text: '#F0F3F8',
  textMuted: '#B6C2D2',
  gain: '#7EDAA7',
  loss: '#FFA2AC',
  zero: '#B6C2D2',
  onPrimary: '#10243E',
  avatar: '#384F70',
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
