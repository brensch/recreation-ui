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

interface SelectedGround {
  ID: string
  Selected: boolean
}

const Component = () => {
  useTitle("schniff details")
  const appContext = useContext(AppContext)
  let { fireAlert } = appContext!

  const [campground, setCampground] = useState<Campground | null>(null)
  const [campsites, setCampsites] = useState<Campsite[]>([])
  const [activeStep, setActiveStep] = React.useState(1)
  const [loops, setLoops] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [selectedCampsites, setSelectedCampsites] = useState<SelectedGround[]>(
    [],
  )

  // date stuff
  const [start, setStart] = useState<Date | null>(null)
  const [days, setDays] = useState<string>("2")

  let params = useParams()

  const ToggleCampsites = (campsites: string[]) => {
    let newCampsites = selectedCampsites

    campsites.forEach((campsite) => {
      newCampsites.every((campsiteIter, i) => {
        if (campsite == campsiteIter.ID) {
          newCampsites[i].Selected = !newCampsites[i].Selected
          // breaks
          return false
        }
      })
    })

    setSelectedCampsites(newCampsites)
  }
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
    const unsub = onSnapshot(
      docRef,
      (doc) => {
        let campsites = doc.data()!.Campsites as unknown as Campsite[]
        setCampsites(campsites)
        let allLoops = campsites.map((campsite) => campsite.Loop)
        // remove duplicates
        setLoops([...new Set<string>(allLoops)])
        let allTypes = campsites.map((campsite) => campsite.Type)
        setTypes([...new Set<string>(allTypes)])

        // initialise selected campsites
        setSelectedCampsites(
          campsites.map((campsite) => ({
            ID: campsite.ID,
            Selected: true,
          })),
        )
      },
      (err: FirebaseError) => {
        logEvent(analytics, "error subscribing to campsite object", {
          error: err,
        })
        fireAlert("error", err.message)
      },
    )
    return () => unsub()
  }, [])

  if (!campground) return <div />

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "100%", backgroundColor: "#d5ab9e" }}>
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          <Grid container>
            <Grid item xs={3}>
              <Box
                component="img"
                sx={{
                  width: "90%",
                }}
                alt={campground.Name}
                src={campground.ImageURL}
              />
            </Grid>

            <Grid item xs={9}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body1">{campground.Name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {campground.AreaName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontSize: 10 }}>
                    {campground.State}, {campground.City}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          paddingTop: 2,
          paddingBottom: 2,
          "& .MuiTextField-root": { width: "100%" },
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
                      // spacing: 2,
                      display: "flex",
                      flexDirection: "column",
                      margin: "#222222",
                      "& .MuiTextField-root": { width: "100%" },
                    }}
                  >
                    <Grid container alignItems="center" padding={0} margin={0}>
                      <Grid item xs={1}>
                        <Checkbox defaultChecked sx={{ paddingLeft: 0 }} />
                      </Grid>
                      <Grid item xs={9}>
                        <Typography variant="body2" sx={{ paddingLeft: 1 }}>
                          All (x of {campsites.length})
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">
                          <IconButton aria-label="delete" size="small">
                            <KeyboardArrowDownIcon />
                          </IconButton>
                        </Typography>
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
                      {types.map((type) => (
                        <React.Fragment>
                          <Grid item xs={1}>
                            <Checkbox defaultChecked sx={{ paddingLeft: 0 }} />
                          </Grid>
                          <Grid item xs={9}>
                            <Typography variant="body2" sx={{ paddingLeft: 1 }}>
                              {type}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">
                              <IconButton aria-label="delete" size="small">
                                <KeyboardArrowDownIcon />
                              </IconButton>
                            </Typography>
                          </Grid>
                        </React.Fragment>
                      ))}

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
                      {loops.map((loop) => (
                        <React.Fragment>
                          <Grid item xs={1}>
                            <Checkbox defaultChecked sx={{ paddingLeft: 0 }} />
                          </Grid>
                          <Grid item xs={9}>
                            <Typography variant="body2" sx={{ paddingLeft: 1 }}>
                              {loop}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">
                              <IconButton aria-label="delete" size="small">
                                <KeyboardArrowDownIcon />
                              </IconButton>
                            </Typography>
                          </Grid>
                        </React.Fragment>
                      ))}

                      <Grid item xs={12} sx={{ paddingTop: 2 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => setActiveStep(2)}
                        >
                          Select {campsites.length} sites
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
                  <Grid container spacing={2}>
                    <Grid item xs={7}>
                      <DatePicker
                        label="I would like to go on"
                        value={start}
                        onChange={(newValue) => {
                          setStart(newValue)
                        }}
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
                    <Grid item xs={5}>
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => setActiveStep(3)}
                      >
                        Yeah nice
                      </Button>
                    </Grid>
                  </Grid>
                </StepContent>
              </Step>
              <Step key="step_3">
                <StepLabel>Review</StepLabel>
                <StepContent>
                  <Typography variant="body2">Yeboiiii</Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Grid>
        </Grid>
      </Container>
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
