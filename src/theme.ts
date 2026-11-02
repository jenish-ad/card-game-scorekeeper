export const lightColors = {
  bg: '#F3F1EC',
  surface: '#FFFFFF',
  surfaceSunken: '#ECE8E1',
  ink: '#17161B',
  onInk: '#FFFFFF',
  text: '#1B1A1F',
  textMuted: '#6B6870',
  mutedText: '#65626A',
  hairline: '#E4DFD7',
  gain: '#0E7A4B',
  gainTint: '#E3F2EA',
  loss: '#C2362F',
  lossTint: '#FBE7E5',
  gold: '#B8862B',
  goldTint: '#F7EDD8',
  focus: '#2F6FDE',
  scoreGain: '#09663D',
  scoreLoss: '#B02B25',
  goldText: '#785616',
  onLoss: '#FFFFFF',
};
export const darkColors: typeof lightColors = {
  bg: '#121114',
  surface: '#1C1B20',
  surfaceSunken: '#0D0C0F',
  ink: '#F2EFE9',
  onInk: '#17161B',
  text: '#F2EFE9',
  textMuted: '#A7A2AB',
  mutedText: '#A7A2AB',
  hairline: '#2C2A31',
  gain: '#5FD39A',
  gainTint: '#15301F',
  loss: '#FF8A80',
  lossTint: '#3A1A18',
  gold: '#E0B65A',
  goldTint: '#33280F',
  focus: '#80ABFF',
  scoreGain: '#5FD39A',
  scoreLoss: '#FF8A80',
  goldText: '#E0B65A',
  onLoss: '#17161B',
};
export const playerPalette = [
  {
    color: '#2F6FDE',
    lightTint: '#E8EFFC',
    darkTint: '#15233D',
    lightText: '#2458B4',
    darkText: '#91B7FF',
  },
  {
    color: '#E0752D',
    lightTint: '#FCEDE3',
    darkTint: '#342114',
    lightText: '#98440E',
    darkText: '#FFB27D',
  },
  {
    color: '#1F9E8F',
    lightTint: '#E1F3EF',
    darkTint: '#112F2B',
    lightText: '#116D61',
    darkText: '#77DCCC',
  },
  {
    color: '#8E5BD6',
    lightTint: '#F0E9FB',
    darkTint: '#2A1D40',
    lightText: '#7040AF',
    darkText: '#C4A2FA',
  },
  {
    color: '#D2457A',
    lightTint: '#FBE7EF',
    darkTint: '#361B29',
    lightText: '#AA2C5D',
    darkText: '#FF9BC1',
  },
  {
    color: '#6E8F2A',
    lightTint: '#EDF2DF',
    darkTint: '#252E14',
    lightText: '#526C1C',
    darkText: '#BEDC7E',
  },
] as const;
const foundations = {
  radius: { card: 18, button: 14, input: 12, chip: 999, mark: 6 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  fonts: {
    title: 'Manrope_800ExtraBold',
    body: 'Manrope_500Medium',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    heavy: 'Manrope_800ExtraBold',
  },
  type: { display: 34, h1: 26, h2: 20, body: 16, label: 14, caption: 12 },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    raised: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
  },
  touchTarget: 44,
  buttonHeight: 52,
  motion: { quick: 160, enter: 260 },
} as const;
export const lightTheme = { ...foundations, colors: lightColors, dark: false };
export const darkTheme = { ...foundations, colors: darkColors, dark: true };
export type AppTheme = Omit<typeof lightTheme, 'fonts' | 'dark'> & {
  dark: boolean;
  fonts: {
    title: string;
    body: string;
    medium: string;
    semibold: string;
    bold: string;
    heavy: string;
  };
};
export const devanagariFonts: AppTheme['fonts'] = {
  title: 'Mukta_800ExtraBold',
  body: 'Mukta_500Medium',
  medium: 'Mukta_500Medium',
  semibold: 'Mukta_600SemiBold',
  bold: 'Mukta_700Bold',
  heavy: 'Mukta_800ExtraBold',
};
export const nepaliLightTheme: AppTheme = {
  ...lightTheme,
  fonts: devanagariFonts,
};
export const nepaliDarkTheme: AppTheme = {
  ...darkTheme,
  fonts: devanagariFonts,
};
export function playerColor(seat: number, dark: boolean) {
  const swatch =
    playerPalette[
      ((seat % playerPalette.length) + playerPalette.length) %
        playerPalette.length
    ];
  return {
    color: dark ? swatch.darkText : swatch.lightText,
    tint: dark ? swatch.darkTint : swatch.lightTint,
    accent: swatch.color,
  };
}
