import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import React, { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const provider = new GoogleAuthProvider()

export default function SignIn() {
  const auth = getAuth()
  let navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const [searchParams] = useSearchParams()
  let redirectTarget = searchParams.get("redirect")

  const redirect = useCallback(() => {
    if (redirectTarget !== null) {
      navigate(redirectTarget)
      return
    }
    navigate("/")
  }, [navigate, redirectTarget])

  // make sure if a user somehow gets to this page whilst logged in that we redirect them as well,
  // since the auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        redirect()
      }
    })
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [auth, redirect])

  const doGoogleSignin = () => {
    setLoading(true)
    setError(null)
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
        const errorMessage = error.message
        setError(errorMessage)
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
        </Box>
        {error && (
          <Typography variant="body1" component="h2" align={"center"}>
            <b>error</b>
          </Typography>
        )}
      </Box>
    </Container>
  )
}
