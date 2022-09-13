import LogoutIcon from "@mui/icons-material/Logout"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import Typography from "@mui/material/Typography"
import { logEvent } from "firebase/analytics"
import { FirebaseError } from "firebase/app"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { getToken } from "firebase/messaging"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { analytics, db, messaging } from ".."
import { AppContext } from "../App"
import { FirestoreCollections, VAPIDKEY } from "../constants"
import useTitle from "../useTitle"

const Component = () => {
  useTitle("profile")
  const [loading, setLoading] = useState(false)
  const appContext = useContext(AppContext)
  let { fireAlert } = appContext!
  const [token, setToken] = useState<string | null>(null)
  const [deviceEnrolled, setDeviceEnrolled] = useState(false)
  const [smsEnabled, setSMSEnabled] = useState(false)
  let navigate = useNavigate()

  const askForPermissioToReceiveNotifications = () => {
    if (!appContext!.user) return

    if (!("Notification" in window)) {
      fireAlert(
        "warning",
        "I told you your device doesn't allow web push notifications. Buy an android.",
      )
      return
    }

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
        fireAlert(
          "success",
          "Nice. You'll now get notifications through your browser on this device when we schniff something for you.",
        ),
      )
      .catch((err) => {
        fireAlert("error", err.toString())
        logEvent(analytics, "error asking permissions", {
          error: err,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // check token on page load
  useEffect(() => {
    // check for crapple
    if (!("Notification" in window)) {
      fireAlert("warning", "Web push notifications won't work on your device.")
      return
    }

    if (Notification.permission === "default") return

    getToken(messaging, {
      vapidKey: VAPIDKEY,
    })
      .then((token) => setToken(token))
      .catch((err: FirebaseError) => {
        if (err.code === "messaging/permission-blocked") {
          fireAlert(
            "warning",
            "You blocked browser notifications on this device. The world is scary, but I'm not scary, I promise.",
          )
          logEvent(analytics, "permission blocked", {
            error: err,
          })
          return
        }

        fireAlert(
          "error",
          "Something's gone wrong checking your permissions. Not sure what's up.",
        )
        logEvent(analytics, "error checking permission", {
          error: err,
        })
      })
  }, [fireAlert])

  // set the device enrolled state based on whether the current token is in the array already
  useEffect(() => {
    if (!token || !appContext?.userSettings) return
    setDeviceEnrolled(
      appContext.userSettings.FirebaseCloudMessagingTokens.includes(token),
    )
    setSMSEnabled(appContext.userSettings.SMSEnabled)
  }, [token, appContext?.userSettings])

  const unenrolDevice = () => {
    if (!appContext!.user || !token) return null

    updateDoc(
      doc(db, FirestoreCollections.USER_SETTINGS, appContext!.user!.uid),
      {
        FirebaseCloudMessagingTokens: arrayRemove(token),
      },
    )
      .then(() =>
        fireAlert(
          "warning",
          "This device will no longer receive web push notifications",
        ),
      )
      .catch((err: FirebaseError) => {
        fireAlert("error", err.message)
        logEvent(analytics, "error unenrolling device", {
          error: err,
        })
      })
  }

  const setSMSState = (enabled: boolean) => {
    if (!appContext!.user || !token) return null

    updateDoc(
      doc(db, FirestoreCollections.USER_SETTINGS, appContext!.user!.uid),
      {
        SMSEnabled: enabled,
      },
    )
      .then(() =>
        fireAlert(
          enabled ? "success" : "warning",
          enabled
            ? "SMS notifications enabled"
            : "This device will no longer receive SMS notifications",
        ),
      )
      .catch((err) => {
        fireAlert("error", err.toString())
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
              SMS Notifications:
            </Typography>
            <Switch
              color={"secondary"}
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
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              Total Schniffalarms:
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
              Remaining Schniffalarms:
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.userInformation &&
                50 - appContext!.userInformation!.NotificationsSent}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() =>
              window.open(
                "https://createstripesession-fczsqdxnba-uw.a.run.app?cart=W3siQWRqdXN0YWJsZVF1YW50aXR5IjpudWxsLCJBbW91bnQiOm51bGwsIkN1cnJlbmN5IjpudWxsLCJEZXNjcmlwdGlvbiI6bnVsbCwiRHluYW1pY1RheFJhdGVzIjpudWxsLCJJbWFnZXMiOm51bGwsIk5hbWUiOm51bGwsIlByaWNlIjoicHJpY2VfMUxoVHVnSXNFaHZrajZsa1FmWkhsZmR0IiwiUHJpY2VEYXRhIjpudWxsLCJRdWFudGl0eSI6MTEwLCJUYXhSYXRlcyI6bnVsbH1d",
                "_self",
              )
            }
          >
            Buy more schniffalarms
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2" sx={{ height: "10px" }}>
            <b>Attention Apple-ists:</b>
            <br />
            Web push{" "}
            <Link
              href="https://developer.apple.com/documentation/usernotifications/sending_web_push_notifications_in_safari_and_other_browsers"
              target="_blank"
            >
              is only available from iOS 16
            </Link>
            , so get that if you want browser based notifications.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Component
