
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
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
import SignIn from './Auth/SignIn';
import Home from './Pages/Home';
import { ProtectedRoute } from './Auth/ProtectedRoute';
import MonitorAdd from './Pages/MonitorAdd';
import MonitorView from './Pages/MonitorView';
import Header from './Components/Header';
import Monitor from './Pages/Monitor';
import SignOut from './Auth/SignOut';
import Search from './Pages/Search';
import Profile from './Pages/Profile';

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
  },
  typography: {
    allVariants: {
      fontFamily: 'monospace',
      textTransform: 'none',
    },
  },
})



function App() {
  return (
    <ThemeProvider theme={brownTheme}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route
          path="monitor"
          element={
            <ProtectedRoute >
              <Monitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitor/add"
          element={
            <ProtectedRoute >
              <MonitorAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitor/view"
          element={
            <ProtectedRoute >
              <MonitorView />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute >
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="signin" element={<SignIn />} />
        <Route path="signout" element={<SignOut />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
