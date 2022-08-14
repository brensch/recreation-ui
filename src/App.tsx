import { CssBaseline } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import React, { useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "./Auth/ProtectedRoute"
import SignIn from "./Auth/SignIn"
import SignOut from "./Auth/SignOut"
import Header from "./Components/Header"
import Explanation from "./Pages/Explanation"
import Home from "./Pages/Home"
import Profile from "./Pages/Profile"
import Schniff from "./Pages/Schniff"
import { getMessaging, onMessage } from "firebase/messaging"
import { messaging } from "."
import { getToken } from "firebase/messaging"

const brownTheme = createTheme({
  palette: {
    background: {
      default: "#b06c34",
    },
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#000000",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      contrastText: "#000000",
    },
    secondary: {
      light: "#966c4a",
      main: "#966c4a",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#000000",
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
      fontFamily: "monospace",
      textTransform: "none",
    },
  },
})
// b08b34
// b04d34

function App() {
  return (
    <ThemeProvider theme={brownTheme}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="explanation" element={<Explanation />} />
        <Route
          path="schniff"
          element={
            <ProtectedRoute>
              <Schniff />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="signin" element={<SignIn />} />
        <Route path="signout" element={<SignOut />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
