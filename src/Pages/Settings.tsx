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
import Divider from "@mui/material/Divider"
import { analytics, db, messaging } from ".."
import { AppContext } from "../App"
import { FirestoreCollections, VAPIDKEY } from "../constants"
import useTitle from "../useTitle"
import { PlanIDs } from "./Setup"

const Component = () => {
  useTitle("profile")
  const [loading, setLoading] = useState(false)
  const appContext = useContext(AppContext)
  let { fireAlert } = appContext!
  const [token, setToken] = useState<string | null>(null)
  const [deviceEnrolled, setDeviceEnrolled] = useState(false)
  const [smsEnabled, setSMSEnabled] = useState(false)
  const [userToken, setUserToken] = useState<string | null>(null)
  let navigate = useNavigate()

  useEffect(() => {
    appContext?.user?.getIdToken().then(setUserToken)
  }, [])

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
        flexDirection: "row",
        // "& .MuiTextField-root": { width: "100%" },
        // "& .MuiTypography-root": { height: "40px" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h5" component="h3" sx={{ flex: 1 }}>
              <b>Settings</b>
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider textAlign="left">
            <Typography variant="body2">SMS</Typography>
          </Divider>
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
              Phone number:
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.user!.phoneNumber}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              SMS notifications this month
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.userInformation &&
                appContext!.userInformation!.NotificationsSent}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Divider textAlign="left">
            <Typography variant="body2">Web Push</Typography>
          </Divider>
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
          <Typography variant="body2" component="h2">
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
        <Grid item xs={12}>
          <Divider textAlign="left">
            <Typography variant="body2">Subscription</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1" component="h3" sx={{ flex: 1 }}>
              Nose strength
            </Typography>
            <Typography variant="body1" component="h3" sx={{ pr: 1 }}>
              {appContext!.subscriptions.filter(
                (sub) => sub.status === "active",
              ).length > 0 &&
              PlanIDs.filter(
                (plan) =>
                  appContext?.subscriptions.filter(
                    (sub) => sub.status === "active",
                  )[0].product.id === plan.Product,
              ).length > 0
                ? PlanIDs.filter(
                    (plan) =>
                      appContext?.subscriptions.filter(
                        (sub) => sub.status === "active",
                      )[0].product.id === plan.Product,
                  )[0].Name
                : "Noseless"}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => {
              fetch(`https://createportalsession-fczsqdxnba-uw.a.run.app`, {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }).then((res) => {
                console.log(res)
                let forwardLocation = res.headers.get("X-Stripe")
                console.log(forwardLocation)
                if (!forwardLocation) {
                  console.log("no forward location")
                  return
                }
                window.open(forwardLocation, "_self")
              })
            }}
          >
            Modify subscription
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Component
