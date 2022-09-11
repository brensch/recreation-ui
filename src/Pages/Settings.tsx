import LogoutIcon from "@mui/icons-material/Logout"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Typography from "@mui/material/Typography"
import { FirebaseError } from "firebase/app"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { getToken } from "firebase/messaging"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { db, messaging } from ".."
import { AppContext } from "../App"
import { FirestoreCollections, VAPIDKEY } from "../constants"
import useTitle from "../useTitle"

const Component = () => {
  useTitle("profile")
  const [loading, setLoading] = useState(false)
  const appContext = useContext(AppContext)
  const [token, setToken] = useState<string | null>(null)
  const [deviceEnrolled, setDeviceEnrolled] = useState(false)
  const [smsEnabled, setSMSEnabled] = useState(false)
  let navigate = useNavigate()

  const askForPermissioToReceiveNotifications = () => {
    if (!appContext!.user) return

    setLoading(true)
    Notification.requestPermission()
      .then((permission) => {
        if (permission !== "granted") {
          throw Error(
            "Can't subscribe, you've blocked notifications. You probably got scared when it asked you for notifications. Don't worry about it. Sort it out, and do better next time.",
          )
        }
      })
      .then(() =>
        getToken(messaging, {
          vapidKey: VAPIDKEY,
        }),
      )
      .then((token) =>
        updateDoc(
          doc(db, FirestoreCollections.USER_SETTINGS, appContext!.user!.uid),
          {
            FirebaseCloudMessagingTokens: arrayUnion(token),
          },
        ),
      )
      .then(() =>
        appContext?.fireAlert(
          "success",
          "Nice. You'll now get notifications through your browser on this device when we schniff something for you.",
        ),
      )
      .catch((err) => {
        appContext?.fireAlert("error", err.toString())
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (Notification.permission === "default") return
    getToken(messaging, {
      vapidKey: VAPIDKEY,
    })
      .then((token) => setToken(token))
      .catch((error: FirebaseError) => {
        if (error.code === "messaging/permission-blocked") {
          appContext?.fireAlert(
            "warning",
            "You blocked browser notifications on this device. The world is scary, but I'm not scary, I promise.",
          )
        }
      })
  }, [appContext])

  // set the device enrolled state based on whether the current token is in the array already
  useEffect(() => {
    if (!token || !appContext?.userSettings) return
    console.log(token)

    setDeviceEnrolled(
      appContext.userSettings.FirebaseCloudMessagingTokens.includes(token),
    )
    setSMSEnabled(appContext.userSettings.SMSEnabled)
  }, [token, appContext?.userSettings])

  const unenrolDevice = () => {
    if (!appContext!.user || !token) {
      return null
    }

    updateDoc(
      doc(db, FirestoreCollections.USER_SETTINGS, appContext!.user!.uid),
      {
        FirebaseCloudMessagingTokens: arrayRemove(token),
      },
    )
      .then(() =>
        appContext?.fireAlert(
          "warning",
          "This device will no longer receive web push notifications",
        ),
      )
      .catch((err: FirebaseError) => {
        appContext?.fireAlert("error", err.message)
      })
  }

  const setSMSState = (enabled: boolean) => {
    if (!appContext!.user || !token) {
      return null
    }

    updateDoc(
      doc(db, FirestoreCollections.USER_SETTINGS, appContext!.user!.uid),
      {
        SMSEnabled: enabled,
      },
    )
      .then(() =>
        appContext?.fireAlert(
          enabled ? "success" : "warning",
          enabled
            ? "SMS notifications enabled"
            : "This device will no longer receive SMS notifications",
        ),
      )
      .catch((err) => {
        appContext?.fireAlert("error", err.toString())
      })
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        paddingTop: 2,
        paddingBottom: 2,
        display: "flex",
        flexDirection: "column",
        "& .MuiTextField-root": { width: "100%" },
        "& .MuiTypography-root": { height: "40px" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h5" component="h3" sx={{ flex: 1 }}>
              <b>Settings</b>
            </Typography>
            <IconButton onClick={() => navigate("/signout")}>
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              User ID:
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.user!.phoneNumber}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              Total SMS Notifications:
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.userInformation &&
                appContext!.userInformation!.NotificationsSent}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              SMS Notifications:
            </Typography>
            <Switch
              color={"secondary"}
              defaultChecked
              checked={smsEnabled}
              onChange={() => {
                setSMSState(!smsEnabled)
              }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              Browser Notifications:
            </Typography>
            <Switch
              disabled={loading}
              color={"secondary"}
              defaultChecked
              checked={deviceEnrolled}
              onChange={() => {
                if (!deviceEnrolled) {
                  askForPermissioToReceiveNotifications()
                  return
                }

                unenrolDevice()
              }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            <b>Attention Apple-ists:</b>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            Web push{" "}
            <Link
              href="https://9to5mac.com/2022/06/06/ios-16-web-push-notifications-safari-update/"
              target="_blank"
            >
              is only available from iOS 16
            </Link>
            , so browser notifications won't work for you.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Component
