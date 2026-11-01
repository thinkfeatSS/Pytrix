import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../shared/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </ThemeProvider>
  );
}
