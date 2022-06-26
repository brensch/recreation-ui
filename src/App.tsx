
import React from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { CssBaseline } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Container from '@mui/material/Container';
import SignIn from './SignIn';

const brownTheme = createTheme({
  palette: {
    background: {
      default: "#80461B"
    },
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#000000',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      contrastText: '#000000',

    },
    secondary: {
      light: '#6F4E37',
      main: '#6F4E37',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#000000',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    // contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    // tonalOffset: 0.3,
  }
})



function App() {
  return (
    <ThemeProvider theme={brownTheme}>
      <CssBaseline />
      <SignIn />
    </ThemeProvider>
  );
}

export default App;
