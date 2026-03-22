import { colors } from './colors';

/** UI tokens that follow light/dark — brand greens stay readable in both. */
export type SemanticTheme = {
  isDark: boolean;
  bg: string;
  bgMuted: string;
  card: string;
  cardMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  headerText: string;
  tabActive: string;
  tabInactive: string;
  shadow: string;
  examBannerBg: string;
  examBannerBorder: string;
  examBannerText: string;
  warnBoxBg: string;
  warnBoxBorder: string;
  warnTitle: string;
  warnBody: string;
  badgeB1Bg: string;
  badgeB1Border: string;
  badgeB2Bg: string;
  badgeB2Border: string;
  badgeC1Bg: string;
  badgeC1Border: string;
  overlay: string;
  codeBg: string;
  brand: string;
  /** Links / secondary accents on dark surfaces (Task pill, tap hints) — lighter in dark mode. */
  linkAccent: string;
  emerald: typeof colors.emerald;
  red: typeof colors.red;
};

export function getSemanticTheme(isDark: boolean): SemanticTheme {
  if (!isDark) {
    return {
      isDark: false,
      bg: colors.slate[50],
      bgMuted: colors.slate[100],
      card: '#ffffff',
      cardMuted: colors.slate[100],
      text: colors.slate[900],
      textSecondary: colors.slate[600],
      textMuted: colors.slate[500],
      border: colors.slate[200],
      borderLight: colors.slate[100],
      inputBg: '#ffffff',
      tabBar: '#ffffff',
      tabBarBorder: colors.slate[100],
      headerBg: '#ffffff',
      headerText: colors.slate[900],
      tabActive: colors.vstepDark,
      tabInactive: colors.slate[400],
      shadow: '#000000',
      examBannerBg: '#fffbeb',
      examBannerBorder: '#fde68a',
      examBannerText: '#92400e',
      warnBoxBg: '#fffbeb',
      warnBoxBorder: '#fde68a',
      warnTitle: '#b45309',
      warnBody: '#92400e',
      badgeB1Bg: colors.emerald[50],
      badgeB1Border: colors.emerald[100],
      badgeB2Bg: '#fef3c7',
      badgeB2Border: '#fde68a',
      badgeC1Bg: '#fee2e2',
      badgeC1Border: '#fecaca',
      overlay: 'rgba(0,0,0,0.45)',
      codeBg: colors.slate[100],
      brand: colors.vstepDark,
      linkAccent: colors.emerald[600],
      emerald: colors.emerald,
      red: colors.red,
    };
  }

  return {
    isDark: true,
    bg: '#0f172a',
    bgMuted: '#1e293b',
    card: '#1e293b',
    cardMuted: '#334155',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    border: '#334155',
    borderLight: '#475569',
    inputBg: '#0f172a',
    tabBar: '#1e293b',
    tabBarBorder: '#334155',
    headerBg: '#1e293b',
    headerText: '#f8fafc',
    tabActive: colors.emerald[500],
    tabInactive: '#64748b',
    shadow: '#000000',
    examBannerBg: '#422006',
    examBannerBorder: '#92400e',
    examBannerText: '#fde68a',
    warnBoxBg: '#422006',
    warnBoxBorder: '#b45309',
    warnTitle: '#fcd34d',
    warnBody: '#fde68a',
    badgeB1Bg: '#064e3b',
    badgeB1Border: '#059669',
    badgeB2Bg: '#713f12',
    badgeB2Border: '#ca8a04',
    badgeC1Bg: '#7f1d1d',
    badgeC1Border: '#dc2626',
    overlay: 'rgba(0,0,0,0.65)',
    codeBg: '#334155',
    brand: colors.vstepDark,
    linkAccent: '#34d399',
    emerald: colors.emerald,
    red: colors.red,
  };
}
