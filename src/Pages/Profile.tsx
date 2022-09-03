import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { arrayUnion, doc, updateDoc } from "firebase/firestore"
import { getToken } from "firebase/messaging"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { db, messaging } from ".."
import { AppContext } from "../App"

// import { UserContext } from "../Auth/ProtectedRoute"
export default () => {
  const [loading, setLoading] = useState(false)
  const appContext = useContext(AppContext)
  const [message, setMessage] = useState<null | string>(null)
  let navigate = useNavigate()

  const askForPermissioToReceiveNotifications = () => {
    if (!appContext!.user) {
      return null
    }

    setLoading(true)
    Notification.requestPermission()
      .then((permission) => {
        if (permission !== "granted") {
          throw Error("permission not granted")
        }
      })
      .then(() =>
        getToken(messaging, {
          vapidKey:
            "BHQaTiV2r3DAZFnlIW_M2KbdTxWwnAkzm_aXSXNyD7e9RHEBII3wauhV_Vf7vCUEBxfSNA15vQYpkQhRKQ2QVf0",
        }),
      )
      .then((token) =>
        updateDoc(doc(db, "users", appContext!.user!.uid), {
          FirebaseCloudMessagingTokens: arrayUnion(token),
        }),
      )
      .catch((err) => {
        setMessage(err)
      })
      .finally(() => {
        setMessage(
          "Nice. You'll now get notifications on this device when we schniff something for you.",
        )
        setLoading(false)
      })
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        paddingTop: 2,
        display: "flex",
        flexDirection: "column",
        "& .MuiTextField-root": { width: "100%" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Profile
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h2">
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
            onClick={() => askForPermissioToReceiveNotifications()}
          >
            Enrol this device in notifications
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            The point of this service is to notify you in real time when
            campsites become available due to others cancelling their
            reservations.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
            If you don't like notifications that's fine, you'll just get emails.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h2">
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
        {message && (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography variant="body1" component="h2" align={"center"}>
                {message}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => navigate("/schniff")}
              >
                Set up my schniffers
              </Button>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    </Container>
  )
}
