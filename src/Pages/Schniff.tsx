import { Typography } from "@mui/material"
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { collection, doc, setDoc, Timestamp } from "firebase/firestore"
import React, { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"

import { db } from ".."
import { AppContext, GroundSummary, MonitorRequest } from "../App"
import useTitle from "../useTitle"

const filterOptions = createFilterOptions<GroundSummary>({
  limit: 30,
})
const Component = () => {
  const [ground, setGround] = useState<GroundSummary | null>(null)
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  let navigate = useNavigate()
  const appContext = useContext(AppContext)
  let { user, monitorRequests } = appContext!

  console.log(monitorRequests)

  // sort schniffs by startdate by default
  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "start",
      sort: "desc" as GridSortDirection,
    },
  ])

  useTitle("schniff")

  // i hate time
  // for the requests to work in firestore we need them all to line up with 0 UTC
  function getDates(startDate: Date, stopDate: Date) {
    var dateArray: Timestamp[] = []
    var currentDate = new Date(startDate)
    var targetDate = new Date(stopDate)
    currentDate.setUTCDate(currentDate.getDate())
    targetDate.setUTCDate(targetDate.getDate())
    currentDate.setUTCHours(0)
    targetDate.setUTCHours(0)
    while (currentDate <= targetDate) {
      dateArray.push(Timestamp.fromDate(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dateArray
  }

  const submitSchniffRequest = () => {
    if (!start || !end || !ground || !user || start > end) {
      return
    }
    setLoading(true)
    // create doc first to get its id
    const docRef = doc(collection(db, "monitor_requests"))
    const monitor: MonitorRequest = {
      Dates: getDates(start, end),
      Ground: ground.EntityID,
      UserID: user.uid,
      Name: ground.Name,
      SiteIDs: [],
      ID: docRef.id,
    }

    setDoc(docRef, monitor)
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

        {appContext &&
          appContext.userInformation &&
          appContext!.userInformation!.FirebaseCloudMessagingTokens!.length ===
            0 && (
            <React.Fragment>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate("/profile")}
                >
                  Turn on Notifications
                </Button>
              </Grid>
            </React.Fragment>
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
            filterOptions={filterOptions}
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
            rows={monitorRequests}
            columns={columns}
            hideFooterPagination
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            getRowId={(row: MonitorRequest) => row.ID}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            onSelectionModelChange={(selection: GridRowId[]) => {
              if (selection.length === 0) {
                return
              }

              navigate(`/schniff/${selection[0]}`)
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
      </Grid>
    </Container>
  )
}

const columns: GridColDef[] = [
  { field: "Name", headerName: "Campground", width: 250 },
  {
    field: "start",
    headerName: "Start",
    width: 100,
    valueGetter: (params) => {
      let schniff: MonitorRequest = params.row
      return schniff.Dates[0].toDate()
    },
    valueFormatter: ({ value }) =>
      `${value.getUTCFullYear()}/${
        value.getUTCMonth() + 1
      }/${value.getUTCDate()}`,
  },
  {
    field: "end",
    headerName: "End",
    width: 100,
    valueGetter: (params) => {
      let schniff: MonitorRequest = params.row
      return schniff.Dates[schniff.Dates.length - 1].toDate()
    },
    valueFormatter: ({ value }) =>
      `${value.getUTCFullYear()}/${
        value.getUTCMonth() + 1
      }/${value.getUTCDate()}`,
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

export default Component
