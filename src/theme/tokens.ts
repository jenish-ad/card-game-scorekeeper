export const lightColors = {
  bg: '#F4F7EF',
  surface: '#FFFFFF',
  surfaceSunken: '#EAF0E3',
  ink: '#205D2D',
  onInk: '#FFFFFF',
  text: '#163821',
  textMuted: '#607060',
  mutedText: '#566650',
  hairline: '#DFE8D8',
  gain: '#205D2D',
  gainTint: '#E5F0CB',
  loss: '#C2362F',
  lossTint: '#FBE7E5',
  gold: '#E7C34D',
  goldTint: '#FFF3BD',
  focus: '#205D2D',
  scoreGain: '#205D2D',
  scoreLoss: '#B02B25',
  goldText: '#685015',
  onLoss: '#FFFFFF',
  sky: '#D4ECF6',
  hillBack: '#C5E2A4',
  hillMid: '#91C96B',
  hillFront: '#58A344',
  sun: '#FFF2B5',
};
export const darkColors: typeof lightColors = {
  bg: '#101B14',
  surface: '#192A1E',
  surfaceSunken: '#132217',
  ink: '#B8E49B',
  onInk: '#163821',
  text: '#EDF4E5',
  textMuted: '#ACBBA5',
  mutedText: '#ACBBA5',
  hairline: '#304532',
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
  sky: '#203D42',
  hillBack: '#3E613C',
  hillMid: '#315632',
  hillFront: '#24472B',
  sun: '#E9D48A',
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
  radius: { card: 22, button: 999, input: 14, chip: 999, mark: 6 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  fonts: {
    title: 'Manrope_800ExtraBold',
    body: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    heavy: 'Manrope_800ExtraBold',
  },
  type: { display: 32, h1: 24, h2: 19, body: 15, label: 14, caption: 12 },
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
export type AppTheme = Omit<typeof lightTheme, 'fonts' | 'dark' | 'type'> & {
  type: { [K in keyof typeof lightTheme.type]: number };
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
  type: { display: 36, h1: 28, h2: 23, body: 18, label: 16, caption: 14 },
};
export const nepaliDarkTheme: AppTheme = {
  ...darkTheme,
  fonts: devanagariFonts,
  type: nepaliLightTheme.type,
};
export function playerColor(colorIndex: number, dark: boolean) {
  const swatch =
    playerPalette[
      ((colorIndex % playerPalette.length) + playerPalette.length) %
        playerPalette.length
    ];
  return {
    color: dark ? swatch.darkText : swatch.lightText,
    tint: dark ? swatch.darkTint : swatch.lightTint,
    accent: swatch.color,
  };
}
