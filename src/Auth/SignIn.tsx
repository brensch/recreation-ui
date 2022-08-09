import MuiAlert, { AlertProps } from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
} from "firebase/auth"

const provider = new GoogleAuthProvider()

export default function SignIn() {
  const auth = getAuth()
  let navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [searchParams] = useSearchParams()
  let redirectTarget = searchParams.get("redirect")

  const redirect = () => {
    if (redirectTarget !== null) {
      navigate(redirectTarget)
      return
    }
    navigate("/")
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user)
      if (user) {
        redirect()
      }
    })
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [])

  const doAnonymousSignin = () => {
    setLoading(true)
    signInAnonymously(auth)
      .then(() => {
        // Signed in..
        redirect()
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        console.log(error)
        // ...
      })
      .finally(() => setLoading(false))
  }

  const doGoogleSignin = () => {
    setLoading(true)
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (!credential) {
          throw new Error("no credentials returned")
        }

        redirect()
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code
        const errorMessage = error.message
        // The email of the user's account used.
        const email = error.customData.email
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error)
        // ...
      })
      .finally(() => setLoading(false))
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2" align={"center"} height={100}>
          Who are you?
        </Typography>

        <Box component="form" noValidate sx={{ mt: 1 }}>
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
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            disabled={loading}
            onClick={doAnonymousSignin}
            sx={{ mt: 3, mb: 2 }}
          >
            It's a secret.
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})
