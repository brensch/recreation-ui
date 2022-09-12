import DoneIcon from "@mui/icons-material/Done"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { IconButton, Link, Stack, Typography } from "@mui/material"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { db } from ".."
import { MonitorRequestProc, Notification } from "../App"
import useTitle from "../useTitle"

const Component = () => {
  const [notification, setNotification] = useState<Notification | null>(null)

  let params = useParams()
  let navigate = useNavigate()
  useTitle("notification details")

  // get notification detail on load
  useEffect(() => {
    const docRef = doc(db, "notifications", params!.id!)
    getDoc(docRef)
      .then((snap) => {
        setNotification(snap.data() as any as Notification)
      })
      .catch(console.log)
  }, [params])

  const ackNotification = () => {
    if (!params.id) return

    updateDoc(doc(db, "notifications", params.id), {
      Acked: new Date(),
    })
      .catch((err) => console.log(err))
      .finally(() => navigate("/notifications"))
  }

  if (!notification) return null

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        paddingTop: 2,
        paddingBottom: 2,
        "& .MuiTextField-root": { width: "100%" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h5" component="h3" sx={{ flex: 1 }}>
              <b>{notification?.Title}</b>
            </Typography>
            <IconButton
              onClick={() =>
                window.open(
                  `https://www.recreation.gov/camping/campgrounds/${notification?.MonitorRequestProcs[0].Delta.GroundID}`,
                  "_blank",
                )
              }
            >
              <OpenInNewIcon />
            </IconButton>
            <IconButton onClick={ackNotification}>
              <DoneIcon />
            </IconButton>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            Found at: {notification.Created.toDate().getUTCFullYear()}/
            {notification.Created.toDate().getUTCMonth()}/
            {notification.Created.toDate().getUTCDate()},{" "}
            {notification.Created.toDate().toLocaleTimeString()}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={notification.MonitorRequestProcs.sort((a, b) => {
              // if a less than b
              if (a.Delta.SiteID < b.Delta.SiteID) return -1
              if (a.Delta.SiteID > b.Delta.SiteID) return 1
              if (a.Delta.DateAffected < b.Delta.DateAffected) return -1
              if (a.Delta.DateAffected > b.Delta.DateAffected) return 1
              return 0
            })}
            getRowId={(row: MonitorRequestProc) =>
              `${row.Delta.DateAffected}-${row.Delta.SiteID}-${row.Delta.NewState}`
            }
            columns={columns}
            // hideFooterPagination
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
      </Grid>
    </Container>
  )
}

const StateMapping = [
  "Unknown",
  "Available",
  "NotAvailable",
  "Reserved",
  "NotReservable",
  "NotReservableManagement",
  "Lottery",
  "NYR",
  "Open",
  "NotAvailableCutoff",
]

const columns: GridColDef[] = [
  {
    field: "SiteID",
    headerName: "Site",
    renderCell: (params) => {
      let proc: MonitorRequestProc = params.row
      if (proc.Delta.SiteName) {
        return proc.Delta.SiteName
      }
      return proc.Delta.SiteID
    },
  },
  {
    field: "Visit",
    headerName: "Book",
    // flex: 1,
    renderCell: (params) => {
      let proc: MonitorRequestProc = params.row
      return (
        <Link
          href={`https://www.recreation.gov/camping/campsites/${proc.Delta.SiteID}`}
          target="_blank"
        >
          Book site
        </Link>
      )
    },
  },
  {
    field: "DateAffected",
    headerName: "On",
    width: 200,
    valueGetter: (params) => {
      let proc: MonitorRequestProc = params.row
      return proc.Delta.DateAffected
    },
    valueFormatter: ({ value }) =>
      `${value.toDate().toLocaleString("en-us", {
        weekday: "short",
        timeZone: "UTC",
      })} - ${value.toDate().getUTCFullYear()}/${
        value.toDate().getUTCMonth() + 1
      }/${value.toDate().getUTCDate()}`,
  },
  {
    field: "NewState",
    headerName: "Change",
    width: 200,
    renderCell: (params) => {
      let proc: MonitorRequestProc = params.row
      return `${StateMapping[proc.Delta.OldState]} -> ${
        StateMapping[proc.Delta.NewState]
      }`
    },
  },
  // TODO: add more details about schniffs
  // {
  //   field: "Schniff",
  //   headerName: "Schniff Responsible",
  //   width: 200,
  //   valueGetter: (params) => {
  //     let proc: MonitorRequestProc = params.row
  //     return proc.Monitor.ID
  //   },
  // },
]

export default Component
