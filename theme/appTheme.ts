import { DefaultTheme } from 'react-native-paper';

export const appTheme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#266DD3',
    onSurfaceVariant: '#919194',
    accent: '#70A288',
    background: '#050019',
    text: '#F7F7FF',
    success: '#70A288',
    error: '#ED6A5A',
    outline: '#266DD3',
    surfaceDisabled: '#8E929A',
    onSurfaceDisabled: '#8E929A',
    outlineVariant: '#333333',
    tertiary: '#FBD1A2',
  },
};
