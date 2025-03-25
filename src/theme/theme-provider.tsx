
import type {} from '@mui/material/themeCssVarsAugmentation';

import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

import { createTheme } from './create-theme';
import { useDarkMode } from './DarkModeContext';
import { useMediaQuery } from '@mui/material';
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)'); 
   const { darkMode,toggleDarkMode } = useDarkMode()
   if(prefersDarkMode){
     toggleDarkMode()
    }
   const isLight = darkMode === false ? (prefersDarkMode === true ? 'dark': 'light') : 'dark'
  // const memoizedValue = useMemo(
  //     () => ({
  //         palette: isLight ? basePalette.light : basePalette.dark,
  //         typography,
  //         breakpoints,
  //         shape: { borderRadius: 8 },
  //         shadows: isLight ? shadows.light : shadows.dark,
  //         customShadows: isLight ? customShadows.light : customShadows.dark
  //     }),
  //     [isLight]
  // )
    const theme = createTheme(isLight)

  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
