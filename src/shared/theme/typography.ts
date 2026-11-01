/**
 * Typography System for Pytrix
 */

import { Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({ ios: 'System', default: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', default: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', default: 'sans-serif' }),
  code: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6,
  code: 1.5,
};

