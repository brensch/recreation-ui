import { Container, CssBaseline, Grid, Typography } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { getAuth, User } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  setDoc,
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
import Settings from "./Pages/Settings"
import Schniff from "./Pages/Schniff"
import { analytics } from "."
import { FirestoreCollections } from "./constants"

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
  EntityID: string
  EntityType: string
  Name: string
  City: string
  Lat: string
  Lon: string
  ParentID: string
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
  userInformation: UserInformation | null
  monitorRequestRows: any[]
  notifications: Notification[]
}

export interface UserInformation {
  Email: string | null
  FirebaseCloudMessagingTokens: string[]
}

export const AppContext = createContext<AppContextInterface | null>(null)

function App() {
  // get user
  const auth = getAuth()
  const [loadingUser, setLoadingUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userInformation, setUserInformation] =
    useState<UserInformation | null>(null)
  const [checkedUserInfo, setCheckedUserInfo] = useState(false)

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
    const docRef = doc(
      db,
      FirestoreCollections.ENTITY_SUMMARY,
      FirestoreCollections.SUMMARY_DOC,
    )
    getDoc(docRef)
      .then((snap) => {
        let campgrounds: GroundSummary[] = snap.data()!.Summary
        setCampgrounds(campgrounds)
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
      collection(db, FirestoreCollections.MONITOR_REQUESTS),
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
      collection(db, FirestoreCollections.NOTIFICATIONS),
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
        logEvent(analytics, "error subscribing to notifications", {
          error: error,
        })
      },
    )
    return () => unsub()
  }, [user])

  // subscribe to user object (for tokens etc)
  useEffect(() => {
    if (!user) {
      return
    }

    const docRef = doc(db, FirestoreCollections.USER_INFO, user.uid)
    const unsub = onSnapshot(
      docRef,
      (doc) => {
        setUserInformation(doc.data() as any as UserInformation)
        setCheckedUserInfo(true)
      },
      (error: any) => {
        logEvent(analytics, "error subscribing to user object", {
          error: error,
        })
      },
    )

    return () => unsub()
  }, [user])

  // see if the user info does not exist, and if it doesn't, add it
  useEffect(() => {
    // return if we haven't finished checking user info or have already got user info
    if (!user || userInformation || !checkedUserInfo) {
      return
    }

    logEvent(analytics, "new user logged in")

    const docRef = doc(db, FirestoreCollections.USER_INFO, user.uid)
    const newUserInfo: UserInformation = {
      FirebaseCloudMessagingTokens: [],
      Email: user!.email,
    }
    setDoc(docRef, newUserInfo).catch((error: any) => {
      logEvent(analytics, "error updating userinformation on first page load", {
        error: error,
      })
    })
  }, [userInformation, user, checkedUserInfo])

  const appContextValues: AppContextInterface = {
    grounds: campgrounds,
    user: user,
    userInformation: userInformation,
    monitorRequestRows: rows,
    notifications: notifications,
  }

  const loadingMessages: string[] = [
    "Enumerating nostrils",
    "Calibrating nostrils",
    "Plucking nosehair",
    "Counting senses (got 5)",
    "Pondering the orb",
    "Coming up with more load messages",
    "Smelling the flowers",
    "Applying sunscreen to nose",
    "Consulting on rhinoplasty",
    "Having rhinoplasty",
    "Recovering from rhinoplasty",
  ]

  var randomLoadingMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]

  if (loadingUser) {
    return (
      <ThemeProvider theme={brownTheme}>
        <CssBaseline />
        <Container component="main" maxWidth="xs">
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
        </Container>
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
                <Settings />
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
