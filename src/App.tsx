import { CssBaseline, Grid, Typography } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { getAuth, User } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { createContext } from "react"
import { Route, Routes } from "react-router-dom"
import { logEvent } from "firebase/analytics"

import { db } from "."
import { ProtectedRoute } from "./Auth/ProtectedRoute"
import SignIn from "./Auth/SignIn"
import SignOut from "./Auth/SignOut"
import Header from "./Components/Header"
import Explanation from "./Pages/Explanation"
import Home from "./Pages/Home"
import NotificationDetails from "./Pages/NotificationDetails"
import Notifications from "./Pages/Notifications"
import Profile from "./Pages/Profile"
import Schniff from "./Pages/Schniff"
import { analytics } from "."

const brownTheme = createTheme({
  palette: {
    background: {
      default: "#b06c34",
    },
    primary: {
      main: "#000000",
      contrastText: "#000000",
    },
    secondary: {
      light: "#966c4a",
      main: "#966c4a",
      contrastText: "#000000",
    },
  },
  typography: {
    allVariants: {
      fontFamily: "monospace",
      textTransform: "none",
    },
  },
})

export interface GroundSummary {
  ID: string
  Name: string
  City: string
  Lat: string
  Lon: string
}

export interface CampsiteDelta {
  DateAffected: Timestamp
  GroundID: string
  NewState: number
  OldState: number
  SiteID: string
  SiteName: string
}

export interface Notification {
  Acked: Timestamp
  Created: Timestamp
  Deltas: CampsiteDelta[]
  Title: string
  User: string
  ID: string
}

interface AppContextInterface {
  grounds: GroundSummary[]
  user: User | null
  monitorRequestRows: any[]
  notifications: Notification[]
}

export const AppContext = createContext<AppContextInterface | null>(null)

function App() {
  // get user
  const auth = getAuth()
  const [loadingUser, setLoadingUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      setUser(newUser)
      setLoadingUser(false)
      logEvent(analytics, "user logged in", {
        user: newUser?.email,
      })
    })
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [auth])

  // get campground list
  const [campgrounds, setCampgrounds] = useState<GroundSummary[]>([])
  useEffect(() => {
    const docRef = doc(db, "grounds_summary", "grounds_summary")
    getDoc(docRef)
      .then((snap) => {
        let campgrounds: GroundSummary[] = snap.data()!.GroundSummaries
        setCampgrounds(
          campgrounds.map((campground) => ({
            ID: campground.ID,
            Name: campground.Name.toLocaleLowerCase(),
            City: campground.City,
            Lat: campground.Lat,
            Lon: campground.Lon,
          })),
        )
      })
      .catch(console.log)
  }, [user])

  // subscribe to monitors
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    if (!user) {
      return
    }

    const q = query(
      collection(db, "monitor_requests"),
      where("UserID", "==", user.uid),
    )

    const unsub = onSnapshot(q, (querySnapshot) => {
      let newRows: any[] = []

      var i = 1
      querySnapshot.forEach((doc) => {
        let data = doc.data()
        let dates: Timestamp[] = data.Dates
        newRows.push({
          id: i,
          ground: data.Name,
          start: dates
            .reduce(function (a, b) {
              return a < b ? a : b
            })
            .toDate(),
          end: dates
            .reduce(function (a, b) {
              return a > b ? a : b
            })
            .toDate(),
          groundID: data.Ground,
          docID: doc.id,
        })

        i++
      })

      setRows(newRows)
    })

    return () => unsub()
  }, [user])

  // subscribe to notifications
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "notifications"),
      where("User", "==", user.uid),
      where("Acked", "<", new Date(0)),
    )
    const unsub = onSnapshot(
      q,
      (querySnapshot) => {
        setNotifications(
          querySnapshot.docs.map((doc) => {
            let notification = doc.data() as any as Notification
            notification.ID = doc.id
            return notification
          }),
        )
      },
      (error: any) => {
        console.log(error)
      },
    )
    return () => unsub()
  }, [user])

  const appContextValues: AppContextInterface = {
    grounds: campgrounds,
    user: user,
    monitorRequestRows: rows,
    notifications: notifications,
  }

  const loadingMessages: string[] = [
    "Enumerating noses",
    "Calibrating nostrils",
    "Plucking nosehair",
    "Counting senses (got 5)",
    "Not commenting on the large nose of the person you're talking to",
    "Pondering the orb",
    "Coming up with more load messages",
  ]

  var randomLoadingMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

  if (loadingUser) {
    return (
      <ThemeProvider theme={brownTheme}>
        <CssBaseline />
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item xs={3}>
            <Typography>{randomLoadingMessage}</Typography>
          </Grid>
        </Grid>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={brownTheme}>
      <AppContext.Provider value={appContextValues}>
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
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications/:id"
            element={
              <ProtectedRoute>
                <NotificationDetails />
              </ProtectedRoute>
            }
          />
          <Route path="signin" element={<SignIn />} />
          <Route path="signout" element={<SignOut />} />
        </Routes>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

export default App
