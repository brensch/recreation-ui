import DeleteIcon from "@mui/icons-material/Delete"
import InfoIcon from "@mui/icons-material/Info"
import InsertLinkIcon from "@mui/icons-material/InsertLink"
import ShareIcon from "@mui/icons-material/Share"
import { Typography } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"

import { db } from ".."
import { AppContext, GroundSummary } from "../App"

const Page = () => {
  const [ground, setGround] = useState<GroundSummary | null>(null)
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<GridRowId | null>(null)
  const [copied, setCopied] = useState(false)
  const [unregistered, setUnregistered] = useState<boolean>(false)

  let navigate = useNavigate()
  const appContext = useContext(AppContext)
  let { user, monitorRequestRows } = appContext!

  // sort schniffs by startdate by default
  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "start",
      sort: "desc" as GridSortDirection,
    },
  ])

  // get whether user has notifications turned on
  useEffect(() => {
    if (!user) {
      return
    }
    const docRef = doc(db, "users", user.uid)
    getDoc(docRef)
      .then((snap) => {
        let data = snap.data()
        // if they have no user object, make one for them so we know their email
        if (data === undefined) {
          setDoc(docRef, {
            Email: user!.email,
          })
          setUnregistered(true)
          return
        }

        if (data.FirebaseCloudMessagingTokens === undefined) {
          setUnregistered(true)
        }
      })
      .catch(console.log)
  }, [user])

  // i hate time
  // for the requests to work in firestore we need them all to line up with 0 UTC
  function getDates(startDate: Date, stopDate: Date) {
    var dateArray: Date[] = []
    var currentDate = new Date(startDate)
    var targetDate = new Date(stopDate)
    currentDate.setUTCDate(currentDate.getDate())
    targetDate.setUTCDate(targetDate.getDate())
    currentDate.setUTCHours(0)
    targetDate.setUTCHours(0)
    while (currentDate <= targetDate) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dateArray
  }

  const submitSchniffRequest = () => {
    if (!start || !end || !ground || !user || start > end) {
      return
    }
    setLoading(true)
    const monitor = {
      Dates: getDates(start, end),
      Ground: ground.ID,
      UserID: user.uid,
      Name: ground.Name,
    }
    addDoc(collection(db, "monitor_requests"), monitor)
      .then(() => {})
      .finally(() => {
        setGround(null)
        setLoading(false)
      })
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        paddingTop: 2,
        paddingBottom: 2,
        "& .MuiTextField-root": { width: "100%" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Add Schniffer
          </Typography>
        </Grid>
        {unregistered && (
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => navigate("/profile")}
            >
              Enable notifications on this device
            </Button>
          </Grid>
        )}
        {unregistered && (
          <Grid item xs={12}>
            <Typography variant="body1" component="h2">
              <b>
                Without notifications you will only receive emails when we find
                new availabilities.
              </b>
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Autocomplete
            options={appContext!.grounds}
            value={ground}
            onChange={(event: any, newValue: GroundSummary | null) => {
              setGround(newValue)
            }}
            getOptionLabel={(option: GroundSummary) =>
              `${option.Name}, ${option.City}`
            }
            id="campground"
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Select a campground to monitor"
                variant="standard"
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="Start date"
            value={start}
            onChange={(newValue) => {
              setStart(newValue)
            }}
            renderInput={(params) => (
              <TextField variant="standard" {...params} />
            )}
          />{" "}
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="End date"
            value={end}
            onChange={(newValue) => {
              setEnd(newValue)
            }}
            renderInput={(params) => (
              <TextField variant="standard" {...params} />
            )}
          />{" "}
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            disabled={
              loading || !start || !end || !ground || !user || start > end
            }
            onClick={() => submitSchniffRequest()}
          >
            Schniff
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Your Schniffs
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={monitorRequestRows}
            columns={columns}
            hideFooterPagination
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            onSelectionModelChange={(selection) => {
              setCopied(false)
              if (selection.length === 0) {
                setSelectedRow(null)
                return
              }
              setSelectedRow(selection[0])
            }}
            sx={{
              borderColor: "transparent",
              "& .MuiDataGrid-iconSeparator": {
                display: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${"#000000"}`,
              },
              "& .MuiDataGrid-columnHeaders": {
                borderBottom: `2px solid ${"#000000"}`,
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: `2px solid ${"#000000"}`,
              },
            }}
          />
        </Grid>
        {selectedRow && typeof selectedRow === "number" && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                avatar={<InfoIcon />}
                title={monitorRequestRows[selectedRow.valueOf() - 1].ground}
                subheader={`${monitorRequestRows[
                  selectedRow.valueOf() - 1
                ].start.toLocaleDateString()} - ${monitorRequestRows[
                  selectedRow.valueOf() - 1
                ].end.toLocaleDateString()}`}
              />

              <CardActions disableSpacing>
                <IconButton
                  aria-label="stop schniffing"
                  onClick={() => {
                    setSelectedRow(null)
                    deleteDoc(
                      doc(
                        db,
                        "monitor_requests",
                        monitorRequestRows[selectedRow.valueOf() - 1].docID,
                      ),
                    )
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  aria-label="visit ground page"
                  onClick={() =>
                    window.open(
                      `https://www.recreation.gov/camping/campgrounds/${
                        monitorRequestRows[selectedRow.valueOf() - 1].groundID
                      }`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <InsertLinkIcon />
                </IconButton>
                <CopyToClipboard
                  text={`I'm schniffing for a campsite at ${
                    monitorRequestRows[selectedRow.valueOf() - 1].ground
                  } from ${monitorRequestRows[
                    selectedRow.valueOf() - 1
                  ].start.toLocaleDateString()} - ${monitorRequestRows[
                    selectedRow.valueOf() - 1
                  ].end.toLocaleDateString()}. Check it out yourself: schniffer: schniffer.com campground: recreation.gov/camping/campgrounds/${
                    monitorRequestRows[selectedRow.valueOf() - 1].groundID
                  }`}
                  onCopy={() => setCopied(true)}
                >
                  <IconButton aria-label="share">
                    <ShareIcon />
                  </IconButton>
                </CopyToClipboard>

                {copied && (
                  <Typography paddingLeft={3}>Copied to clipboard</Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

const columns: GridColDef[] = [
  { field: "ground", headerName: "Campground", width: 250 },
  {
    field: "start",
    headerName: "Start",
    width: 100,
    valueFormatter: ({ value }) =>
      `${value.getUTCFullYear()}/${value.getUTCMonth()}/${value.getUTCDate()}`,
  },
  {
    field: "end",
    headerName: "End",
    width: 100,
    valueFormatter: ({ value }) =>
      `${value.getUTCFullYear()}/${value.getUTCMonth()}/${value.getUTCDate()}`,
  },
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

export default Page
