import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
// import * as firestore from "firebase/firestore"
// this is the dumbest shit after all the modular imports to not have arrayUnion defined
// import firebase from "firebase/compat/app"
// import { firestore } from "firebase/app"
import React, { useEffect, useState, useContext } from "react"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  getRedirectResult,
  reauthenticateWithPopup,
  linkWithPopup,
  signInWithCredential,
} from "firebase/auth"
import Tooltip from "@mui/material/Tooltip"

import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { db } from ".."
import { UserContext } from "../Auth/ProtectedRoute"
import { Divider } from "@mui/material"
import Link from "@mui/material/Link"
import IconButton from "@mui/material/IconButton"
import InfoIcon from "@mui/icons-material/Info"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { getMessaging, onMessage } from "firebase/messaging"
import { messaging } from ".."
import { getToken } from "firebase/messaging"
import { NineKOutlined } from "@mui/icons-material"
import { Navigate, useNavigate } from "react-router-dom"
const provider = new GoogleAuthProvider()

export default () => {
  const [pushbulletAPIKey, setPushbulletAPIKey] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [linked, setLinked] = useState(false)
  const user = useContext(UserContext)
  const [error, setError] = useState<null | string>(null)
  const [message, setMessage] = useState<null | string>(null)
  let navigate = useNavigate()

  const [fcm, setFCM] = useState(false)
  const [fcmToken, setFCMToken] = useState("")

  useEffect(() => {
    const unsub = onMessage(messaging, (payload) => {
      console.log("Message received. ", payload)
      setFCM(true)
    })
    return () => unsub()
  })

  const askForPermissioToReceiveNotifications = () => {
    if (!user) {
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
        setDoc(doc(db, "users", user.uid), {
          FirebaseCloudMessagingTokens: token,
        }),
      )
      .catch((err) => {
        console.log(err)
        setMessage(err)
      })
      .finally(() => {
        setMessage(
          "Nice. You'll now get notifications on this device when we schniff something for you.",
        )
        setLoading(false)
      })
  }

  const doGoogleSignin = () => {
    if (!user) {
      return
    }
    setLoading(true)
    linkWithPopup(user, provider)
      .catch((error) => {
        console.log(error)
        if (error.code == "auth/credential-already-in-use") {
          setError(
            "You've already used that service with a different account. Signout by clicking the face in the top right, then sign in again with that account.",
          )
          return
        }
        setError(error.toString())
      })
      .finally(() => setLoading(false))
  }

  if (!user) {
    return <div />
  }

  // prompt user that they need to link their account to a proper auth provider
  if (user?.isAnonymous) {
    return (
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          padding: 1,
          spacing: 2,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          "& .MuiTextField-root": { m: 1, width: "100%" },
        }}
      >
        <Typography
          variant="body2"
          component="h2"
          align={"center"}
          height={100}
        >
          You signed in anonymously to check things out. If you want to start
          schniffing, you need to sign in.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          disabled={loading}
          onClick={doGoogleSignin}
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In With Google
        </Button>
        {error && (
          <Typography
            variant="body2"
            component="h2"
            align={"center"}
            height={100}
          >
            {error}
          </Typography>
        )}
      </Container>
    )
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        padding: 4,
        // spacing: 4,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        "& .MuiTextField-root": { m: 1, width: "100%" },
      }}
    >
      <Typography
        variant="body1"
        component="h2"
        height={"50px"}
        align={"center"}
      >
        Signed in as {user.email}
      </Typography>

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
      <br />
      {message && (
        <React.Fragment>
          <Typography
            variant="body1"
            component="h2"
            height={"50px"}
            align={"center"}
          >
            {message}
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => navigate("/schniff")}
          >
            Set up my schniffers
          </Button>
        </React.Fragment>
      )}
    </Container>
  )
}
