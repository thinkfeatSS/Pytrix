/**
 * Centralized Design System Colors for Pytrix
 * Adheres to WCAG AA contrast standards with high-legibility syntax colors.
 */

export const palette = {
  // Brand
  pythonBlue: '#387EB8',
  pythonYellow: '#FFE873',
  pythonYellowWarm: '#FFD43B',
  primary: '#6366F1',       // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // Status & Feedback
  success: '#10B981',       // Green
  successBackground: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',       // Amber
  warningBackground: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',         // Red
  errorBackground: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',          // Blue
  infoBackground: 'rgba(59, 130, 246, 0.12)',

  // Syntax Highlighting Tokens
  syntaxKeyword: '#C678DD',   // Purple (def, if, for, while, in, return)
  syntaxString: '#98C379',    // Green ("hello", 'text')
  syntaxNumber: '#D19A66',    // Orange (42, 3.14)
  syntaxFunction: '#61AFEF',  // Cyan/Blue (print, input, len)
  syntaxComment: '#5C6370',   // Gray muted (# comment)
  syntaxBracket: '#E5C07B',   // Gold/Amber ((), [], {})
  syntaxGhost: '#555A70',     // Faded Gray for handwriting copybook trace layer
  syntaxGhostMismatch: '#FF4D4D',

  // Neutrals - Dark Mode First
  darkBg: '#0F111A',
  darkSurface: '#181A26',
  darkSurfaceElevated: '#212435',
  darkBorder: '#2C3047',
  darkTextPrimary: '#F3F4F6',
  darkTextSecondary: '#9CA3AF',
  darkTextMuted: '#6B7280',

  // Neutrals - Light Mode
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightSurfaceElevated: '#F1F5F9',
  lightBorder: '#E2E8F0',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#475569',
  lightTextMuted: '#94A3B8',
};

export const darkThemeColors = {
  background: palette.darkBg,
  surface: palette.darkSurface,
  surfaceElevated: palette.darkSurfaceElevated,
  border: palette.darkBorder,
  textPrimary: palette.darkTextPrimary,
  textSecondary: palette.darkTextSecondary,
  textMuted: palette.darkTextMuted,
  primary: palette.primary,
  primaryLight: palette.primaryLight,
  pythonYellow: palette.pythonYellowWarm,
  pythonBlue: palette.pythonBlue,
  success: palette.success,
  successBg: palette.successBackground,
  warning: palette.warning,
  warningBg: palette.warningBackground,
  error: palette.error,
  errorBg: palette.errorBackground,
  info: palette.info,
  infoBg: palette.infoBackground,
  syntax: {
    keyword: palette.syntaxKeyword,
    string: palette.syntaxString,
    number: palette.syntaxNumber,
    function: palette.syntaxFunction,
    comment: palette.syntaxComment,
    bracket: palette.syntaxBracket,
    ghost: palette.syntaxGhost,
    ghostMismatch: palette.syntaxGhostMismatch,
  },
};

export const lightThemeColors = {
  background: palette.lightBg,
  surface: palette.lightSurface,
  surfaceElevated: palette.lightSurfaceElevated,
  border: palette.lightBorder,
  textPrimary: palette.lightTextPrimary,
  textSecondary: palette.lightTextSecondary,
  textMuted: palette.lightTextMuted,
  primary: palette.primaryDark,
  primaryLight: palette.primary,
  pythonYellow: palette.pythonYellowWarm,
  pythonBlue: palette.pythonBlue,
  success: palette.success,
  successBg: palette.successBackground,
  warning: palette.warning,
  warningBg: palette.warningBackground,
  error: palette.error,
  errorBg: palette.errorBackground,
  info: palette.info,
  infoBg: palette.infoBackground,
  syntax: {
    keyword: '#8A2BE2',
    string: '#2E7D32',
    number: '#D97706',
    function: '#0284C7',
    comment: '#64748B',
    bracket: '#B45309',
    ghost: '#94A3B8',
    ghostMismatch: '#DC2626',
  },
};

