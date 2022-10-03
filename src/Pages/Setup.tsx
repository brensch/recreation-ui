import { Typography } from "@mui/material"
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import StepContent from "@mui/material/StepContent"
import StepButton from "@mui/material/StepButton"
import FormGroup from "@mui/material/FormGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import Divider from "@mui/material/Divider"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import IconButton from "@mui/material/IconButton"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Chip from "@mui/material/Chip"
import {
  ConfirmationResult,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react"
import { FirestoreCollections } from "../constants"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore"
import { FirebaseError } from "firebase/app"
import { logEvent } from "firebase/analytics"
import { analytics, db, messaging } from ".."

import {
  AppContext,
  Campground,
  Campsite,
  GroundSummary,
  MonitorRequest,
} from "../App"
import useTitle from "../useTitle"
import { useNavigate, useParams } from "react-router-dom"
import { Stack } from "@mui/system"

const filterOptions = createFilterOptions<GroundSummary>({
  limit: 30,
})

interface SelectedCampsite {
  index: number
  selected: boolean

  ID: string
  Name: string
  Type: string
  Loop: string
  AllowsFire: boolean | undefined
}

interface Grouping {
  Value: string
  Campsites: SelectedCampsite[]
}

const Component = () => {
  useTitle("Set up a schniff")
  const appContext = useContext(AppContext)
  let { fireAlert } = appContext!
  const auth = getAuth()

  const [campground, setCampground] = useState<Campground | null>(null)
  const [campsites, setCampsites] = useState<Campsite[]>([])
  const [activeStep, setActiveStep] = React.useState(1)
  const [loops, setLoops] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [relay, setRelay] = useState<number>(-1)
  const [relayRefresh, setRelayRefresh] = useState<boolean>(false)
  const [selectedCampsites, setSelectedCampsites] = useState<
    SelectedCampsite[]
  >([])

  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [confirmationCode, setConfirmationCode] = useState<string>("")
  const [phoneConfirmation, setPhoneConfirmation] =
    useState<ConfirmationResult | null>(null)
  const [validNumber, setValidNumber] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  // const [selectionArray, setSelectionArray] = useState<boolean[]>([])

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
    setSigningIn(true)
    phoneConfirmation
      .confirm(confirmationCode)
      .catch((error) => {
        fireAlert("error", error.message)
      })
      .finally(() => setSigningIn(false))
  }

  // date stuff
  const [start, setStart] = useState<Date | null>(null)
  const [days, setDays] = useState<string>("2")

  let params = useParams()

  const ToggleCampsites = useCallback(
    (toggleCampsites: number[], state: boolean) => {
      let selectionArrayClone = [...selectedCampsites]
      toggleCampsites.forEach(
        (index) =>
          (selectionArrayClone[index] = {
            index: selectionArrayClone[index].index,
            selected: state,
            ID: selectionArrayClone[index].ID,
            Name: selectionArrayClone[index].Name,
            Type: selectionArrayClone[index].Type,
            Loop: selectionArrayClone[index].Loop,
            AllowsFire: selectionArrayClone[index].AllowsFire,
          }),
      )
      setSelectedCampsites(selectionArrayClone)
      console.log("toggled", toggleCampsites)
    },
    [selectedCampsites],
  )

  // const ToggleCampsite = (index: number) => {
  //   ToggleCampsites([index], !selectedCampsites[index].selected)
  // }

  // const ToggleCampsites = (toggleCampsites: number[], state: boolean) => {
  //   let selectionArrayClone = [...selectedCampsites]
  //   toggleCampsites.forEach(
  //     (index) =>
  //       (selectionArrayClone[index] = {
  //         index: selectionArrayClone[index].index,
  //         selected: state,
  //         ID: selectionArrayClone[index].ID,
  //         Name: selectionArrayClone[index].Name,
  //         Type: selectionArrayClone[index].Type,
  //         Loop: selectionArrayClone[index].Loop,
  //         AllowsFire: selectionArrayClone[index].AllowsFire,
  //       }),
  //   )
  //   setSelectedCampsites(selectionArrayClone)
  //   console.log("toggled", toggleCampsites)
  // }

  // there has to be a better way to do this. Needed to decouple the setting of the campsite
  // in the memoized chip, because otherwise i need to update the function which triggers a render leading to
  // slow filtering on phones.
  useEffect(() => {
    if (!relayRefresh) return
    ToggleCampsites([relay], !selectedCampsites[relay].selected)
    setRelayRefresh(false)
  }, [relay, relayRefresh])

  useEffect(() => {
    let docID = window.atob(params.id!)
    console.log(docID)
    const docRef = doc(db, FirestoreCollections.CAMPGROUNDS, docID)
    const unsub = onSnapshot(
      docRef,
      (doc) => {
        setCampground(doc.data() as unknown as Campground)
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to campground object", {
          error: err,
        })
        fireAlert("error", err.message)
      },
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    let docID = window.atob(params.id!)
    console.log(docID)
    const docRef = doc(db, FirestoreCollections.CAMPSITES, docID)
    getDoc(docRef).then(
      (doc) => {
        let campsites = doc.data()!.Campsites as unknown as Campsite[]
        campsites = campsites.filter((campsite) => campsite.Reservable)
        setCampsites(campsites)

        let allLoops = campsites.map((campsite) => campsite.Loop)
        let loops = [...new Set<string>(allLoops)]
        loops.sort()
        setLoops(loops)

        let allTypes = campsites.map((campsite) => campsite.Type)
        let types = [...new Set<string>(allTypes)]
        types.sort()
        setTypes(types)

        // initialise selected campsites
        let selectedCampsites = campsites.map((campsite, i) => ({
          index: i,
          selected: true,

          ID: campsite.ID,
          Name: campsite.Name,
          Type: campsite.Type,
          Loop: campsite.Loop,
          AllowsFire: campsite.Campfires,
        }))

        setSelectedCampsites(selectedCampsites)
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to campsite object", {
          error: err,
        })
        fireAlert("error", err.message)
      },
    )
  }, [])

  if (!campground || !campsites)
    return (
      <Container component="main" maxWidth="xs">
        {/* center some text is this complex */}
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item xs={3}>
            <Typography>Loading campground</Typography>
          </Grid>
        </Grid>
      </Container>
    )

  return (
    <Box>
      <Box sx={{ width: "100%", backgroundColor: "#d5ab9e" }}>
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            padding: 1,
            // paddingTop: 2,
            // paddingBottom: 2,
          }}
        >
          <Stack direction="row" alignItems="center">
            <Box
              component="img"
              sx={{
                height: "80px",
                // width: "100%",
                padding: 0,
                objectFit: "cover",
              }}
              alt={campground.Name}
              src={campground.ImageURL}
            />
            <Stack direction="column" sx={{ paddingLeft: 1 }}>
              <Typography variant="body1">{campground.Name}</Typography>
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {campground.AreaName}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 10 }}>
                {campground.State}, {campground.City}
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          paddingTop: 2,
          paddingBottom: 2,
          "& .MuiTextField-root": { width: "100%" },
          "& .MuiStepContent-root": { paddingLeft: 0 },
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              color="secondary"
              sx={{
                "& .MuiStepIcon-active": { color: "red" },
                "& .MuiStepIcon-completed": { color: "green" },
              }}
            >
              <Step key="step_0">
                <StepLabel>Choose a Destination</StepLabel>
              </Step>
              <Step key="step_1">
                <StepButton
                  onClick={() => {
                    if (activeStep < 1) return
                    setActiveStep(1)
                  }}
                >
                  Filter Campsites
                </StepButton>
                <StepContent>
                  <Container
                    component="main"
                    maxWidth="md"
                    sx={{
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",

                      // margin: "#222222",
                      "& .MuiTextField-root": { width: "100%" },
                      "& .MuiContainer-root": { padding: 0 },
                    }}
                  >
                    <Grid container padding={0} margin={0}>
                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          // justifyContent={"center"}
                          alignItems="center"
                        >
                          <Checkbox
                            checked={
                              selectedCampsites.length ===
                              selectedCampsites.filter(
                                (campsite) => campsite.selected,
                              ).length
                            }
                            indeterminate={
                              selectedCampsites.filter(
                                (campsite) => campsite.selected,
                              ).length > 0 &&
                              selectedCampsites.length !==
                                selectedCampsites.filter(
                                  (campsite) => campsite.selected,
                                ).length
                            }
                            onClick={(e) => {
                              e.stopPropagation()
                              ToggleCampsites(
                                selectedCampsites.map(
                                  (campsite) => campsite.index,
                                ),
                                selectedCampsites.length !==
                                  selectedCampsites.filter(
                                    (campsite) => campsite.selected,
                                  ).length,
                              )
                            }}
                          />

                          <Typography variant="body2">
                            All (
                            {
                              selectedCampsites.filter(
                                (campsite) => campsite.selected,
                              ).length
                            }{" "}
                            of {campsites.length})
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider
                          textAlign="left"
                          sx={{
                            borderBottomWidth: 3,
                            borderColor: "black",
                          }}
                        >
                          <Typography>Filter by Type</Typography>
                        </Divider>
                      </Grid>
                      {types.map((type) => {
                        let sites = selectedCampsites.filter(
                          (campsite) => campsite.Type === type,
                        )
                        let currentCampsites = sites.filter(
                          (campsite) => campsite.selected,
                        )
                        return (
                          <Grid
                            item
                            xs={12}
                            padding={0}
                            sx={{
                              "& .MuiAccordionSummary-content": { margin: 0 },
                            }}
                          >
                            <Accordion
                              elevation={0}
                              // sx={{ borderWidth: 0, padding: 0, margin: 0 }}
                              disableGutters
                              TransitionProps={{ unmountOnExit: true }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ padding: 0, margin: 0 }}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <Stack
                                  direction="row"
                                  // justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ width: "100%" }}
                                >
                                  <Checkbox
                                    checked={
                                      sites.length === currentCampsites.length
                                    }
                                    indeterminate={
                                      currentCampsites.length > 0 &&
                                      sites.length !== currentCampsites.length
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      ToggleCampsites(
                                        sites.map((campsite) => campsite.index),
                                        sites.length !==
                                          currentCampsites.length,
                                      )
                                    }}
                                  />
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ width: "100%" }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ flex: 9 }}
                                    >
                                      {type}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      align="right"
                                      sx={{ flex: 1, fontSize: 12 }}
                                    >
                                      {currentCampsites.length}/{sites.length}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </AccordionSummary>
                              <AccordionDetails>
                                {sites.map((campsite) => {
                                  return (
                                    <CampsiteState
                                      Campsite={campsite}
                                      setRelay={setRelay}
                                      setRelayRefresh={setRelayRefresh}
                                      // ToggleCampsites={ToggleCampsites}
                                      // ToggleCampsite={ToggleCampsite}
                                    />
                                  )
                                })}
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        )
                      })}

                      <Grid item xs={12}>
                        <Divider
                          textAlign="left"
                          sx={{
                            borderBottomWidth: 3,
                            borderColor: "black",
                          }}
                        >
                          <Typography>Filter by Loop</Typography>
                        </Divider>
                      </Grid>
                      {loops.map((loop) => {
                        let sites = selectedCampsites.filter(
                          (campsite) => campsite.Loop === loop,
                        )
                        let currentCampsites = sites.filter(
                          (campsite) => campsite.selected,
                        )
                        return (
                          <Grid
                            item
                            xs={12}
                            padding={0}
                            sx={{
                              "& .MuiAccordionSummary-content": { margin: 0 },
                            }}
                          >
                            <Accordion
                              elevation={0}
                              // sx={{ borderWidth: 0, padding: 0, margin: 0 }}
                              disableGutters
                              TransitionProps={{ unmountOnExit: true }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ padding: 0, margin: 0 }}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <Stack
                                  direction="row"
                                  // justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ width: "100%" }}
                                >
                                  <Checkbox
                                    checked={
                                      sites.length === currentCampsites.length
                                    }
                                    indeterminate={
                                      currentCampsites.length > 0 &&
                                      sites.length !== currentCampsites.length
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      ToggleCampsites(
                                        sites.map((campsite) => campsite.index),
                                        sites.length !==
                                          currentCampsites.length,
                                      )
                                    }}
                                  />
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ width: "100%" }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ flex: 9 }}
                                    >
                                      {loop}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      align="right"
                                      sx={{ flex: 1, fontSize: 12 }}
                                    >
                                      {currentCampsites.length}/{sites.length}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </AccordionSummary>
                              <AccordionDetails>
                                {sites.map((campsite) => {
                                  return (
                                    <CampsiteState
                                      Campsite={campsite}
                                      setRelay={setRelay}
                                      setRelayRefresh={setRelayRefresh}
                                      // ToggleCampsites={ToggleCampsites}
                                      // ToggleCampsite={ToggleCampsite}
                                    />
                                  )
                                })}
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        )
                      })}

                      <Grid
                        item
                        xs={12}
                        sx={{ padding: 2, alignContent: "right" }}
                      >
                        <Button
                          variant="contained"
                          color="secondary"
                          disabled={
                            selectedCampsites.filter(
                              (campsite) => campsite.selected,
                            ).length === 0
                          }
                          onClick={() => setActiveStep(2)}
                        >
                          Select{" "}
                          {
                            selectedCampsites.filter(
                              (campsite) => campsite.selected,
                            ).length
                          }{" "}
                          sites
                        </Button>
                      </Grid>
                    </Grid>
                  </Container>
                </StepContent>
              </Step>
              <Step key="step_2">
                <StepButton
                  onClick={() => {
                    if (activeStep < 2) return
                    setActiveStep(2)
                  }}
                >
                  Select Dates
                </StepButton>
                <StepContent>
                  <Grid container spacing={2} padding={2}>
                    <Grid item xs={7}>
                      <DatePicker
                        label="I would like to go on"
                        value={start}
                        onChange={(newValue) => {
                          setStart(newValue)
                        }}
                        disablePast
                        renderInput={(params) => (
                          <TextField variant="standard" {...params} />
                        )}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <FormControl variant="standard" sx={{ width: "100%" }}>
                        <InputLabel id="demo-simple-select-standard-label">
                          ...and stay for
                        </InputLabel>
                        <Select
                          value={days}
                          onChange={(e: SelectChangeEvent) =>
                            setDays(e.target.value)
                          }
                        >
                          {[...Array(14).keys()].map((count) => (
                            <MenuItem
                              value={count + 1}
                              key={`daycount-${count}`}
                            >
                              {count + 1} day{count > 0 && "s"}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        color="secondary"
                        variant="contained"
                        disabled={!start}
                        onClick={() => setActiveStep(3)}
                      >
                        I'm excited
                      </Button>
                    </Grid>
                  </Grid>
                </StepContent>
              </Step>
              <Step key="step_3">
                <StepLabel>Notifications</StepLabel>
                <StepContent>
                  <form>
                    <Container
                      component="main"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        // padding: 5,
                      }}
                    >
                      <Grid container spacing={2}>
                        {auth.currentUser ? (
                          <React.Fragment>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                We'll text you at {auth.currentUser.phoneNumber}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                color="secondary"
                                variant="contained"
                                disabled={!start}
                                onClick={() => setActiveStep(4)}
                              >
                                I eagerly await your messages
                              </Button>
                            </Grid>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {!phoneConfirmation ? (
                              <React.Fragment>
                                <Grid item xs={12}>
                                  <Typography variant="body2">
                                    Where should we send your notifications when
                                    we find something for you?
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    variant="standard"
                                    fullWidth
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                      setPhoneNumber(
                                        formatPhoneNumber(e.target.value),
                                      )
                                    }
                                    label="Your phone number (US only)"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: 10 }}
                                  >
                                    We will only use your phone number to send
                                    notifications about campsites we've
                                    schniffed for you.
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    id="phone-sign-in"
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
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <Grid item xs={12}>
                                  <TextField
                                    variant="standard"
                                    type="number"
                                    label="Confirmation code, just sent via SMS"
                                    value={confirmationCode}
                                    onChange={(e) => {
                                      e.preventDefault()
                                      setConfirmationCode(e.target.value)
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    type="submit"
                                    disabled={signingIn}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      confirmCode()
                                    }}
                                    sx={{ mt: 3, mb: 2 }}
                                  >
                                    Confirm code
                                  </Button>
                                </Grid>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        )}
                      </Grid>
                    </Container>
                  </form>
                </StepContent>
              </Step>
              <Step key="step_1">
                <StepButton
                  onClick={() => {
                    if (activeStep < 1) return
                    setActiveStep(1)
                  }}
                >
                  Confirm
                </StepButton>
                <StepContent>
                  <Typography variant="body2">
                    Final step coming soon.
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Grid>
        </Grid>
      </Container>
      {verifying && <div id="recaptcha-container" />}
    </Box>
  )
}

const columns: GridColDef[] = [
  { field: "Name", headerName: "Campsite" },
  { field: "Loop", headerName: "Loop" },
]

function CustomNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      Ain't got no schniffs.
    </Box>
  )
}

export default Component

interface CampsiteStateProps {
  Campsite: SelectedCampsite
  // ToggleCampsites(toggleCampsites: number[], state: boolean): void
  // ToggleCampsite(campsite: number): void
  setRelay: React.Dispatch<React.SetStateAction<number>>
  setRelayRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

const CampsiteState = React.memo<CampsiteStateProps>(
  (props) => {
    return (
      <Chip
        // key={item.value}
        label={
          <Typography
            variant="body2"
            sx={{
              fontSize: 10,
            }}
          >
            {`${props.Campsite.Name} `}
          </Typography>
        }
        sx={{ margin: 0.2 }}
        onClick={() => {
          props.setRelay(props.Campsite.index)
          props.setRelayRefresh(true)
        }}
        variant={props.Campsite.selected ? "filled" : "outlined"}
      />
    )
  },
  (prevProps, nextProps) => {
    return prevProps.Campsite.selected === nextProps.Campsite.selected
  },
)
