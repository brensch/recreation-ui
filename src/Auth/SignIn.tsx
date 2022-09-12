import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { FirebaseError } from "firebase/app"
import {
  ConfirmationResult,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { AppContext } from "../App"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFFFFF",
      contrastText: "#FFFFFF",
    },
  },
  typography: {
    allVariants: {
      fontFamily: "Montserrat",
      textTransform: "none",
    },
  },
})

export default function SignIn() {
  const auth = getAuth()
  auth.useDeviceLanguage()
  let navigate = useNavigate()
  const appContext = useContext(AppContext)
  let { fireAlert } = appContext!
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [confirmationCode, setConfirmationCode] = useState<string>("")
  const [phoneConfirmation, setPhoneConfirmation] =
    useState<ConfirmationResult | null>(null)
  const [validNumber, setValidNumber] = useState(false)

  const [searchParams] = useSearchParams()
  let redirectTarget = searchParams.get("redirect")

  function formatPhoneNumber(value: string) {
    setValidNumber(false)
    // if input value is falsy eg if the user deletes the input, then just return
    if (!value) return value

    // clean the input for any non-digit values.
    const parsed = value.replace(/[^\d]/g, "")

    // phoneNumberLength is used to know when to apply our formatting for the phone number
    const phoneNumberLength = parsed.length

    // we need to return the value with no formatting if its less then four digits
    // this is to avoid weird behavior that occurs if you  format the area code to early

    if (phoneNumberLength < 4) return parsed

    // if phoneNumberLength is greater than 4 and less the 7 we start to return
    // the formatted number
    if (phoneNumberLength < 7) {
      return `(${parsed.slice(0, 3)}) ${parsed.slice(3)}`
    }

    // we can set this true since we parse it at the end regardless if it's more than 10
    if (phoneNumberLength >= 10) setValidNumber(true)

    // finally, if the phoneNumberLength is greater then seven, we add the last
    // bit of formatting and return it.
    return `(${parsed.slice(0, 3)}) ${parsed.slice(3, 6)}-${parsed.slice(
      6,
      10,
    )}`
  }

  // verifications are performed on change of the verifying state.
  // this is so that we can unload the div that has the recaptcha mounted against it.
  // if you don't do it this way, verifier.clear() doesn't actually clear.
  // You still need to kill the DOM object it mounted against or it complains, so
  // mounting the object it's loading against only when the verifying is requested,
  // and then only doing the verification in response to the change so that the element
  // is loaded by the time we instantiate the Recaptcha object is the only way to do this.
  // Spaghett.
  const sendCode = () => {
    setVerifying(true)
  }
  const [verifying, setVerifying] = useState(false)
  useEffect(() => {
    if (!verifying) return

    let verifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
      },
      auth,
    )

    signInWithPhoneNumber(auth, `+1 ${phoneNumber}`, verifier)
      .then((confirmationResult: ConfirmationResult) => {
        setPhoneConfirmation(confirmationResult)
      })
      .catch((error: FirebaseError) => {
        fireAlert("error", error.message)
      })
      .finally(() => {
        verifier.clear()
        setVerifying(false)
      })
  }, [verifying, fireAlert, phoneNumber, auth])

  const confirmCode = () => {
    if (!phoneConfirmation) return
    phoneConfirmation.confirm(confirmationCode).catch((error) => {
      fireAlert("error", error.message)
    })
  }

  const redirect = useCallback(() => {
    if (redirectTarget !== null) {
      navigate(redirectTarget)
      return
    }
    navigate("/")
  }, [navigate, redirectTarget])

  // make sure if a user somehow gets to this page whilst logged in that we redirect them as well,
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        redirect()
      }
    })
    return () => unsubscribe()
  }, [auth, redirect])

  return (
    <Box sx={{ width: "100%" }}>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 5,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" height={100}>
              <b>Where should we send your Schniff results?</b>
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ width: "100%", backgroundColor: "#222222" }}>
        <form>
          <Container
            component="main"
            maxWidth="xs"
            sx={{
              display: "flex",
              flexDirection: "column",
              margin: "#222222",
              padding: 5,
            }}
          >
            {!phoneConfirmation ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ThemeProvider theme={darkTheme}>
                    <TextField
                      variant="standard"
                      fullWidth
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(formatPhoneNumber(e.target.value))
                      }
                      label="Your phone number (US only)"
                    />
                  </ThemeProvider>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    id="phone-sign-in"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    type="submit"
                    disabled={!validNumber || verifying}
                    onClick={sendCode}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Send code
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ThemeProvider theme={darkTheme}>
                    <TextField
                      variant="standard"
                      fullWidth
                      label="Confirmation code, just sent via SMS"
                      value={confirmationCode}
                      onChange={(e) => {
                        e.preventDefault()
                        setConfirmationCode(e.target.value)
                      }}
                    />
                  </ThemeProvider>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault()
                      confirmCode()
                    }}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Confirm code
                  </Button>
                </Grid>
              </Grid>
            )}
          </Container>
        </form>
      </Box>
      {/* By mounting and unmounting this we can avoid issues remounting */}
      {verifying && <div id="recaptcha-container" />}
    </Box>
  )
}
