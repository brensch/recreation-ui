import { Container, Grid, Typography } from "@mui/material"
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { logEvent } from "firebase/analytics"
import { FirebaseError } from "firebase/app"
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
import { getMessaging, onMessage } from "firebase/messaging"
import React, { createContext, useCallback, useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"

import { analytics, db } from "."
import { ProtectedRoute } from "./Auth/ProtectedRoute"
import SignIn from "./Auth/SignIn"
import SignOut from "./Auth/SignOut"
import Header from "./Components/Header"
import { FirestoreCollections } from "./constants"
import Explanation from "./Pages/Explanation"
import Home from "./Pages/Home"
import NotificationDetails from "./Pages/NotificationDetails"
import Notifications from "./Pages/Notifications"
import PaymentComplete from "./Pages/PaymentComplete"
import Setup from "./Pages/Setup"
import Schniff from "./Pages/Schniff"
import SchniffDetails from "./Pages/SchniffDetails"
import Settings from "./Pages/Settings"
import Search from "./Pages/Search"

export const brownTheme = createTheme({
  palette: {
    background: {
      default: "#FFFFFF",
    },
    primary: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      light: "#d5ab9e",
      main: "#d5ab9e",
      contrastText: "#000000",
    },
  },
  typography: {
    allVariants: {
      fontFamily: "Montserrat",
    },
  },
})

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export interface Campground {
  Source: number

  ID: string
  AreaID: string
  AreaName: string
  Name: string
  Country: string
  City: string
  State: string
  Org: string
  Lat: string
  Lon: string

  Reservable: boolean

  Rating: number
  NumberOfRatings: number

  ImageURL?: string
  MaxPrice?: number
  MinPrice?: number
  CellCoverage?: number

  Description: string

  Notices: string[]
  CampMethods: string[]
  Activities: string[]
}

export interface Campsite {
  ID: string
  Name: string
  Loop: string
  Type: string

  Reservable: boolean

  Rating: number
  NumberOfRatings: number

  ImageURL?: string
  Campfires?: boolean
  MinPeople?: number
  MaxPeople?: number
  MaxVehicles?: number
  CheckIn?: number
  CheckOut?: number
  Shaded?: boolean
  CellCoverage?: number
  ToiletFacts?: string

  Notices: string[]
  CampMethods: string[]
}

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

export interface MonitorRequest {
  ID: string
  Dates: Timestamp[]
  Ground: string
  UserID: string
  Name: string
  SiteIDs: string[]
}

export interface MonitorRequestProc {
  Delta: CampsiteDelta
  Monitor: MonitorRequest
}

export interface Notification {
  Acked: Timestamp
  Created: Timestamp
  MonitorRequestProcs: MonitorRequestProc[]
  Title: string
  GroundName: string
  UserID: string
  ID: string
}

interface AlertFunc {
  (severity: AlertColor, message: string): void
}

interface AppContextInterface {
  grounds: GroundSummary[]
  user: User | null
  userInformation: UserInformation | null
  userSettings: UserSettings | null
  monitorRequests: MonitorRequest[]
  notifications: Notification[]
  fireAlert: AlertFunc
}

export interface UserInformation {
  Email: string
  PhoneNumber: string
  NotificationsSent: number
}

export interface UserSettings {
  FirebaseCloudMessagingTokens: string
  EmailUnverified: string
  NotificationsEnabled: number
  SMSEnabled: boolean
}

export const AppContext = createContext<AppContextInterface | null>(null)

function App() {
  // get user
  const auth = getAuth()

  const [loadingUser, setLoadingUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // FireAlert fires an admiral snackbar alert
  const [alertSeverity, setAlertSeverity] = useState<AlertColor | undefined>(
    undefined,
  )
  const [alertMessage, setAlertMessage] = useState("")
  const [open, setOpen] = React.useState(false)
  const FireAlert = useCallback((severity: AlertColor, message: string) => {
    setOpen(false)
    setAlertSeverity(severity)
    setAlertMessage(message)
    setOpen(true)
  }, [])

  // used by admiral snackbar to prevent closing on click away.
  // user must press x instead, think this is desirable.
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return
    }
    setOpen(false)
  }

  // subscribe to user state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (newUser) => {
        setUser(newUser)
        setLoadingUser(false)
        logEvent(analytics, "user logged in", {
          user: newUser?.email,
        })
      },
      // suspect this will fail if it actually occurs, no type
      (err: any) => {
        logEvent(analytics, "authorising", {
          error: err,
        })
        FireAlert("error", `Error authorising: ${err.toString()}`)
      },
    )
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [auth, FireAlert])

  // get campground list
  const [campgrounds, setCampgrounds] = useState<GroundSummary[]>([])
  useEffect(() => {
    if (!user) return

    const docRef = doc(
      db,
      FirestoreCollections.ENTITY_SUMMARY,
      FirestoreCollections.SUMMARY_DOC,
    )
    getDoc(docRef).then(
      (snap) => {
        let campgrounds: GroundSummary[] = snap.data()!.Summary
        setCampgrounds(campgrounds)
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error retrieving campgrounds", {
          error: err,
        })
        FireAlert("error", `Error retrieving campgrounds: ${err.message}`)
      },
    )
  }, [user, FireAlert])

  // subscribe to monitors
  const [monitorRequests, setMonitorRequests] = useState<MonitorRequest[]>([])
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, FirestoreCollections.MONITOR_REQUESTS),
      where("UserID", "==", user.uid),
    )

    const unsub = onSnapshot(
      q,
      (querySnapshot) => {
        let monitorRequests = querySnapshot.docs.map(
          (snap) => snap.data() as any as MonitorRequest,
        )
        setMonitorRequests(monitorRequests)
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to monitors", {
          error: err,
        })
        FireAlert("error", `Error getting monitor requests: ${err.message}`)
      },
    )

    return () => unsub()
  }, [user, FireAlert])

  // subscribe to notifications
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    if (!user) return

    // note this requires an index (if rebuilding firestore for instance)
    const q = query(
      collection(db, FirestoreCollections.NOTIFICATIONS),
      where("UserID", "==", user.uid),
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
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to notifications", {
          error: err,
        })
        FireAlert("error", err.message)
      },
    )
    return () => unsub()
  }, [user, FireAlert])

  // subscribe to user object (for verified state, count of total notifications etc)
  const [userInformation, setUserInformation] =
    useState<UserInformation | null>(null)
  useEffect(() => {
    if (!user) return

    const docRef = doc(db, FirestoreCollections.USER_INFO, user.uid)
    const unsub = onSnapshot(
      docRef,
      (doc) => {
        setUserInformation(doc.data() as any as UserInformation)
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to user object", {
          error: err,
        })
        FireAlert("error", err.message)
      },
    )
    return () => unsub()
  }, [user, FireAlert])

  // subscribe to user object (for tokens etc)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  useEffect(() => {
    if (!user) return

    const docRef = doc(db, FirestoreCollections.USER_SETTINGS, user.uid)
    const unsub = onSnapshot(
      docRef,
      (doc) => {
        setUserSettings(doc.data() as any as UserSettings)
      },
      (error: any) => {
        logEvent(analytics, "error subscribing to user object", {
          error: error,
        })
      },
    )

    return () => unsub()
  }, [user, FireAlert])

  // respond to messages we receive while user is looking at site
  const messaging = getMessaging()
  onMessage(messaging, (payload) => {
    FireAlert(
      "success",
      "The schniffer found something! Check notifications for details.",
    )
  })

  // AppContext is used to pass all state we will use throughout multiple views.
  const appContextValues: AppContextInterface = {
    grounds: campgrounds,
    user: user,
    userInformation: userInformation,
    userSettings: userSettings,
    monitorRequests: monitorRequests,
    notifications: notifications,
    fireAlert: FireAlert,
  }

  // thought it would be fun to do a different load message on each load
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
        <Container component="main" maxWidth="xs">
          {/* center some text is this complex */}
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

  // main body
  return (
    <ThemeProvider theme={brownTheme}>
      <AppContext.Provider value={appContextValues}>
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
          <Route path="setup/:id" element={<Setup />} />
          <Route
            path="schniff/:id"
            element={
              <ProtectedRoute>
                <SchniffDetails />
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
          <Route
            path="success"
            element={
              <ProtectedRoute>
                <PaymentComplete />
              </ProtectedRoute>
            }
          />
          <Route path="search" element={<Search />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signout" element={<SignOut />} />
        </Routes>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={alertSeverity}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

export default App
