import DeleteIcon from "@mui/icons-material/Delete"
import LaunchIcon from "@mui/icons-material/Launch"
import { Typography } from "@mui/material"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { logEvent } from "firebase/analytics"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { analytics, db } from ".."
import { AppContext, MonitorRequest } from "../App"
import { FirestoreCollections } from "../constants"
import useTitle from "../useTitle"

export interface SiteAvailability {
  CampsiteID: string
  Date: Timestamp
  State: number
}

interface MatchingAvailabilities {
  id: number
  date: Date
  availabilities: SiteAvailability[]
}

const Component = () => {
  useTitle("schniff details")

  let params = useParams()
  let navigate = useNavigate()
  const appContext = useContext(AppContext)
  let { user, monitorRequests } = appContext!

  let [schniff, setSchniff] = useState<MonitorRequest | null>(null)
  let [availabilities, setAvailabilities] = useState<SiteAvailability[]>([])
  let [rows, setRows] = useState<MatchingAvailabilities[]>([])
  let [totalFreeSites, setTotalFreeSites] = useState<number>(0)
  let [totalFreeDates, setTotalFreeDates] = useState<number>(0)

  // get the monitor request from the list of monitor requests and the id of this page.
  // i don't think monitor requests should be shareable so it's fine to get it from the
  // users own monitor requests
  useEffect(() => {
    let schniff = monitorRequests.find(
      (req: MonitorRequest) => req.ID === params.id,
    )
    if (schniff === undefined) {
      return
    }

    setSchniff(schniff)
  }, [monitorRequests, navigate, params])

  // subscribe to user object (for tokens etc)
  useEffect(() => {
    if (!user || !schniff) return
    const q = query(
      collection(db, FirestoreCollections.AVAILABILITY),
      where("GroundID", "==", schniff?.Ground),
    )
    const unsub = onSnapshot(
      q,
      (querySnapshot) => {
        let allAvailabilities: SiteAvailability[] = []
        querySnapshot.forEach((doc) => {
          allAvailabilities = allAvailabilities.concat(
            doc.data()!.Availabilities as any as SiteAvailability[],
          )
        })
        setAvailabilities(allAvailabilities)
      },
      (error: any) => {
        logEvent(analytics, "error subscribing to user object", {
          error: error,
        })
      },
    )

    return () => unsub()
  }, [user, schniff])

  // do grouping of availabilities with schniff
  useEffect(() => {
    if (!schniff) return

    let newRows = schniff?.Dates.map((date, i) => ({
      id: i,
      date: date.toDate(),
      availabilities: availabilities.filter(
        (availability) =>
          availability.Date.isEqual(date) && availability.State === 1,
      ),
    }))

    setRows(newRows)

    setTotalFreeSites(
      newRows.reduce(
        (sum: number, currentValue: MatchingAvailabilities) =>
          sum + currentValue.availabilities.length,
        0,
      ),
    )

    setTotalFreeDates(
      newRows.reduce((sum: number, currentValue: MatchingAvailabilities) => {
        if (currentValue.availabilities.length === 0) return sum
        return sum + 1
      }, 0),
    )
  }, [availabilities, schniff])

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
        {/* <Grid item xs={9}>
          <Typography variant="h5" component="h3">
            Schniff Details
          </Typography>
        </Grid> */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={1}>
            <Typography variant="h5" component="h3" sx={{ flex: 1 }}>
              Schniff Details
            </Typography>
            <IconButton
              aria-label="delete"
              onClick={() =>
                deleteDoc(
                  doc(db, FirestoreCollections.MONITOR_REQUESTS, params!.id!),
                ).then(() => navigate("/schniff"))
              }
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              aria-label="visit"
              onClick={() =>
                window.open(
                  `https://www.recreation.gov/camping/campgrounds/${schniff?.Ground}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <LaunchIcon />
            </IconButton>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h3">
            {schniff?.Name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="h3">
            There {totalFreeSites === 1 ? "is" : "are"} currently{" "}
            {totalFreeSites} site{totalFreeSites !== 1 ? "s" : ""} available
            across {totalFreeDates} day
            {totalFreeDates !== 1 ? "s" : ""}.{" "}
            {totalFreeSites === 0
              ? "Hopefully someone changes their mind soon."
              : "We'll keep looking for you in case something better opens up, but if you've got a campsite, don't forget to delete this schniff."}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
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
      </Grid>
    </Container>
  )
}

const columns: GridColDef[] = [
  {
    field: "date",
    headerName: "Date",
    flex: 1,
    valueFormatter: ({ value }) =>
      `${value.toLocaleString("en-us", {
        weekday: "short",
        timeZone: "UTC",
      })} - ${value.getUTCFullYear()}/${
        value.getUTCMonth() + 1
      }/${value.getUTCDate()}`,
  },
  {
    field: "availabilities",
    headerName: "Available",
    flex: 1,
    valueFormatter: ({ value }) => value.length,
  },
]

export default Component
