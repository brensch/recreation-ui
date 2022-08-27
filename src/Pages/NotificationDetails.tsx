import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import React, { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Button from "@mui/material/Button"
import { useNavigate } from "react-router-dom"
import { Typography } from "@mui/material"

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { AppContext, CampsiteDelta, Notification } from "../App"
import { db } from ".."

export default () => {
  const appContext = useContext(AppContext)
  const [notification, setNotification] = useState<Notification | null>(null)

  let params = useParams()
  let navigate = useNavigate()

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
      .then(() => navigate("/notifications"))
      .catch((err) => console.log(err))
  }
  // let notification = appContext?.notifications.find(
  //   (notification) => notification.ID === params.id,
  // )

  if (!notification) return <div />

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
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            {notification?.Title}{" "}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          Found at: {notification?.Created.toDate().toLocaleString()}
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() =>
              window.open(
                `https://www.recreation.gov/camping/campgrounds/${notification?.Deltas[0].GroundID}`,
                "_blank",
              )
            }
          >
            See Campground
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={ackNotification}
          >
            Dismiss
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Changes found:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={notification.Deltas}
            getRowId={(row: CampsiteDelta) =>
              `${row.DateAffected}-${row.SiteID}-${row.NewState}`
            }
            columns={columns}
            hideFooterPagination
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
  { field: "SiteID", headerName: "Site" },
  {
    field: "OldState",
    headerName: "From",
    width: 120,
    valueFormatter: ({ value }) => StateMapping[value],
  },
  {
    field: "NewState",
    headerName: "To",
    width: 120,
    valueFormatter: ({ value }) => StateMapping[value],
  },
  {
    field: "DateAffected",
    headerName: "On",
    // flex: 1,
    valueFormatter: ({ value }) => value.toDate().toLocaleDateString(),
  },
  {
    field: "Visit",
    headerName: "Links",
    // flex: 1,
    renderCell: (params) => {
      console.log(params.row)
      let delta: CampsiteDelta = params.row
      return (
        <Button
          onClick={() =>
            window.open(
              `https://www.recreation.gov/camping/campsites/${delta.SiteID}`,
              "_blank",
            )
          }
        >
          See Site
        </Button>
      )
    },
  },
]
