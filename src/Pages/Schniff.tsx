import DeleteIcon from "@mui/icons-material/Delete"
import InfoIcon from "@mui/icons-material/Info"
import InsertLinkIcon from "@mui/icons-material/InsertLink"
import ShareIcon from "@mui/icons-material/Share"
import { Typography } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"

import { db } from ".."
import { UserContext } from "../Auth/ProtectedRoute"

interface GroundSummary {
  ID: string
  Name: string
  City: string
  Lat: string
  Lon: string
}

export default () => {
  const [ground, setGround] = useState<GroundSummary | null>(null)
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [gettingGrounds, setGettingGrounds] = useState(true)
  const [campgrounds, setCampgrounds] = useState<GroundSummary[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [selectedRow, setSelectedRow] = useState<GridRowId | null>(null)
  const [copied, setCopied] = useState(false)
  const [apiKey, setAPIKey] = useState<string | null>(null)
  const [unregistered, setUnregistered] = useState<boolean>(false)
  let navigate = useNavigate()

  const user = useContext(UserContext)

  // get ground summaries
  useEffect(() => {
    if (!user) {
      return
    }

    console.log(user.isAnonymous)
    const docRef = doc(db, "users", user.uid)
    getDoc(docRef)
      .then((snap) => {
        if (snap.data() === undefined) {
          setUnregistered(true)
          return
        }
        console.log(snap.data())
        // let campgrounds: GroundSummary[] = snap.data()!.GroundSummaries
        // setCampgrounds(campgrounds)
        // setGettingGrounds(false)
      })
      .catch(console.log)
  }, [user])

  useEffect(() => {
    const docRef = doc(db, "grounds_summary", "grounds_summary")
    getDoc(docRef)
      .then((snap) => {
        console.log(snap.data())
        let campgrounds: GroundSummary[] = snap.data()!.GroundSummaries
        setCampgrounds(campgrounds)
        setGettingGrounds(false)
      })
      .catch(console.log)
  }, [])

  console.log(loading)
  console.log(start)
  console.log(end)
  console.log(ground)
  console.log(user)
  console.log(loading || !start || !end || !ground || !user || start > end)

  // subscribe to monitors of user
  useEffect(() => {
    if (!user) {
      return
    }

    const q = query(
      collection(db, "monitor_requests"),
      where("UserID", "==", user.uid),
    )

    const unsub = onSnapshot(q, (querySnapshot) => {
      let newRows: any[] = []

      var i = 1
      querySnapshot.forEach((doc) => {
        let data = doc.data()
        let dates: Timestamp[] = data.Dates
        console.log(data)
        newRows.push({
          id: i,
          ground: data.Name,
          start: dates
            .reduce(function (a, b) {
              return a < b ? a : b
            })
            .toDate(),
          end: dates
            .reduce(function (a, b) {
              return a > b ? a : b
            })
            .toDate(),
          groundID: data.Ground,
          docID: doc.id,
        })

        i++
      })

      setRows(newRows)
    })

    return () => unsub()
  }, [user])

  function getDates(startDate: Date, stopDate: Date) {
    startDate.setUTCHours(0)
    stopDate.setUTCHours(0)
    var dateArray = new Array()
    var currentDate = new Date(startDate)
    var targetDate = new Date(stopDate)
    while (currentDate <= targetDate) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dateArray
  }

  const submitSchniffRequest = () => {
    if (!start || !end || !ground || !user || start > end || unregistered) {
      return
    }
    setLoading(true)

    addDoc(collection(db, "monitor_requests"), {
      Dates: getDates(start, end),
      Ground: ground.ID,
      UserID: user.uid,
      Name: ground.Name,
    })
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
        "& .MuiTextField-root": { width: "100%" },
      }}
    >
      <Grid container spacing={2}>
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
        <Grid item xs={12}>
          <Autocomplete
            options={campgrounds}
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
              loading ||
              !start ||
              !end ||
              !ground ||
              !user ||
              start > end ||
              unregistered
            }
            onClick={() => submitSchniffRequest()}
          >
            Schniff {unregistered && "(need to enable notifications)"}
          </Button>
        </Grid>

        {rows && (
          <Grid item xs={12}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              hideFooterPagination
              onSelectionModelChange={(selection) => {
                setCopied(false)
                if (selection.length === 0) {
                  setSelectedRow(null)
                  return
                }
                console.log(selection)
                setSelectedRow(selection[0])
              }}
              sx={{
                width: "100%",
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
        )}
        {selectedRow && typeof selectedRow === "number" && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                avatar={<InfoIcon />}
                title={rows[selectedRow.valueOf() - 1].ground}
                subheader={`${rows[
                  selectedRow.valueOf() - 1
                ].start.toLocaleDateString()} - ${rows[
                  selectedRow.valueOf() - 1
                ].end.toLocaleDateString()}`}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  TODO: display stats of number of state changes schniffed.
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton
                  aria-label="stop schniffing"
                  onClick={() => {
                    setSelectedRow(null)
                    deleteDoc(
                      doc(
                        db,
                        "monitor_requests",
                        rows[selectedRow.valueOf() - 1].docID,
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
                        rows[selectedRow.valueOf() - 1].groundID
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
                    rows[selectedRow.valueOf() - 1].ground
                  } from ${rows[
                    selectedRow.valueOf() - 1
                  ].start.toLocaleDateString()} - ${rows[
                    selectedRow.valueOf() - 1
                  ].end.toLocaleDateString()}. Check it out yourself, https://schniffer.web.app `}
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
  { field: "ground", headerName: "Campground", flex: 1 },
  {
    field: "start",
    headerName: "Start",
    width: 100,
    valueFormatter: ({ value }) => value.toLocaleDateString(),
  },
  {
    field: "end",
    headerName: "End",
    width: 100,
    valueFormatter: ({ value }) => value.toLocaleDateString(),
  },
]
