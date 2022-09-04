import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
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
  const [loading, setLoading] = useState(false)
  const appContext = useContext(AppContext)
  const [message, setMessage] = useState<null | string>(null)
  const [token, setToken] = useState<string | null>(null)
  const [deviceEnrolled, setDeviceEnrolled] = useState(false)
  let navigate = useNavigate()
  useTitle("profile")

  const askForPermissioToReceiveNotifications = () => {
    if (!appContext!.user) return

    setLoading(true)
    Notification.requestPermission()
      .then((permission) => {
        console.log(permission)
        if (permission !== "granted") {
          throw Error(
            "can't subscribe, you've blocked notifications. You probably got scared when it asked you for notifications. Don't worry about it. Sort it out, and do better next time.",
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
          doc(db, FirestoreCollections.USER_INFO, appContext!.user!.uid),
          {
            FirebaseCloudMessagingTokens: arrayUnion(token),
          },
        ),
      )
      .then(() =>
        setMessage(
          "Nice. You'll now get notifications on this device when we schniff something for you.",
        ),
      )
      .catch((err) => {
        setMessage(err.toString())
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
        console.log(error.code)
        if (error.code === "messaging/permission-blocked") {
          setMessage(
            "You blocked notifications on this device. Figure out how to unblock them if you want to get notifications on this device. If you can't figure that out, buying a new phone is probably easier for you.",
          )
        }
      })
  }, [])

  // set the device enrolled state based on whether the current token is in the array already
  useEffect(() => {
    if (!token || !appContext?.userInformation) return
    console.log(token)

    setDeviceEnrolled(
      appContext.userInformation.FirebaseCloudMessagingTokens.includes(token),
    )
  }, [token, appContext?.userInformation])

  const unenrolDevice = () => {
    if (!appContext!.user || !token) {
      return null
    }

    setLoading(true)
    updateDoc(doc(db, FirestoreCollections.USER_INFO, appContext!.user!.uid), {
      FirebaseCloudMessagingTokens: arrayRemove(token),
    })
      .then(() =>
        setMessage("This device will no longer receive notifications"),
      )
      .finally(() => setLoading(false))
  }

  const unenrolAllDevices = () => {
    if (!appContext!.user) {
      return null
    }

    setLoading(true)
    updateDoc(doc(db, FirestoreCollections.USER_INFO, appContext!.user!.uid), {
      FirebaseCloudMessagingTokens: [],
    })
      .then(() =>
        setMessage(
          "None of your devices will receive notifications. Not a great idea imho",
        ),
      )
      .finally(() => setLoading(false))
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
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Settings
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h3">
            Account
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            component="h2"
            style={{ textOverflow: "ellipsis", overflow: "hidden" }}
          >
            Signed in as {appContext!.user!.email}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={loading}
            onClick={() => navigate("/signout")}
          >
            Sign Out
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h3">
            Notifications
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            Devices receiving notifications:{" "}
            {appContext?.userInformation?.FirebaseCloudMessagingTokens?.length}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          {!deviceEnrolled ? (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={loading}
              onClick={() => askForPermissioToReceiveNotifications()}
            >
              Turn On
            </Button>
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={loading}
              onClick={() => unenrolDevice()}
            >
              Turn Off
            </Button>
          )}
        </Grid>
        <Grid item xs={6}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={loading}
            onClick={() => unenrolAllDevices()}
          >
            Remove all
          </Button>
        </Grid>
        {message && (
          <Grid item xs={12}>
            <Typography variant="body2" component="h2">
              <b>{message}</b>
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body1" component="h2">
            Notifications, an apologia:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" component="h2">
            The point of this service is to notify you in real time when
            campsites become available due to others cancelling their
            reservations.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" component="h2">
            If you don't like notifications that's fine, you'll just get emails.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" component="h2">
            When popular sites become available we analysed the average time
            until it's rebooked is 15 minutes. Do you respond to emails within
            15 minutes?
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h2">
            Attention Apple-ists:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            Web push{" "}
            <Link
              href="https://9to5mac.com/2022/06/06/ios-16-web-push-notifications-safari-update/"
              target="_blank"
            >
              is only available as of iOS 16
            </Link>
            , so notifications won't work for you. You'll still receive an
            email.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Component
