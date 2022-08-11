import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { doc, onSnapshot, setDoc } from "firebase/firestore"
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
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { db } from ".."
import { UserContext } from "../Auth/ProtectedRoute"
import { Divider } from "@mui/material"

const provider = new GoogleAuthProvider()

export default () => {
  const [pushbulletAPIKey, setPushbulletAPIKey] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [linked, setLinked] = useState(false)
  const user = useContext(UserContext)
  const [error, setError] = useState<null | string>(null)
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  // the context doesn't update when we link, so just using the auth object direectly on this page.
  // const auth = getAuth()

  const updateUserSettings = () => {
    if (!user) {
      return
    }
    setLoading(true)
    setPushbulletAPIKey("")

    setDoc(doc(db, "users", user.uid), {
      pushbullet: pushbulletAPIKey,
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPushbulletAPIKey(event.target.value)
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

  console.log(user?.isAnonymous)

  useEffect(() => {
    if (!user) {
      return
    }
    const unsub = onSnapshot(doc(db, "users", user?.uid), (doc) => {
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server"
      console.log(source, " data: ", doc.data())
      if (!doc || doc.data() === undefined) {
        return
      }
      setCurrentKey(doc.data()!.pushbullet)
    })

    return () => unsub()
  }, [user])

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

  // prompt for api key changes
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
      <Typography variant="body2" component="h2" align={"center"}>
        We use Pushbullet to send notifications.
        <br />
        It's free, all you have to do is:
      </Typography>

      <ul>
        <li>
          <Typography variant="body2" component="h2">
            Sign up
          </Typography>
        </li>
        <li>
          <Typography variant="body2" component="h2">
            Go to settings
          </Typography>
        </li>
        <li>
          <Typography variant="body2" component="h2">
            Click 'Create Access Token'
          </Typography>
        </li>
      </ul>
      <br />
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={() =>
          window.open(
            `https://www.pushbullet.com/`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        Make a Pushbullet account
      </Button>
      <TextField
        id="campground-url"
        label="Pushbullet API Key"
        placeholder="Get this from pushbullet.com"
        variant="standard"
        value={pushbulletAPIKey}
        onChange={handleChange}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="secondary"
        disabled={loading || pushbulletAPIKey === "" || !pushbulletAPIKey}
        onClick={() => updateUserSettings()}
      >
        Submit
      </Button>
      <br />
      <Typography variant="body2" component="h2" align={"center"}>
        Current key:
      </Typography>
      <Typography variant="body2" component="h2" align={"center"}>
        {currentKey ? currentKey : "Key not set."}
      </Typography>
      <br />
      {/* <Button
        type="submit"
        fullWidth
        variant="contained"
        color="secondary"
        disabled={loading}
        onClick={() => updateUserSettings()}
      >
        Test API
      </Button> */}
    </Container>
  )
}
