import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"

import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import React, { useContext, useEffect, useState } from "react"
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  writeBatch,
} from "firebase/firestore"
import { db } from ".."

import { useNavigate } from "react-router-dom"

import { AppContext, Notification } from "../App"

export default () => {
  const appContext = useContext(AppContext)
  const [acking, setAcking] = useState<boolean>(false)

  let navigate = useNavigate()

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "Created",
      sort: "desc" as GridSortDirection,
    },
  ])

  const ackAllsNotification = () => {
    setAcking(true)
    const batch = writeBatch(db)

    appContext?.notifications.forEach((notification) => {
      const ref = doc(db, "notifications", notification.ID)
      batch.update(ref, {
        Acked: new Date(),
      })
    })

    batch
      .commit()
      .catch((err) => console.log(err))
      .finally(() => setAcking(false))
  }

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
          <Typography variant="h5" component="h3">
            Notifications
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={appContext!.notifications}
            columns={columns}
            hideFooterPagination
            getRowId={(row: Notification) => row.ID}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            onRowClick={(row: GridRowParams<any>) =>
              navigate(`/notifications/${row.id}`)
            }
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
      <Grid item xs={6}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={ackAllsNotification}
        >
          Dismiss all
        </Button>
      </Grid>
    </Container>
  )
}

const columns: GridColDef[] = [
  { field: "Title", headerName: "Message", width: 500 },
  {
    field: "Created",
    headerName: "Created",
    valueFormatter: ({ value }) => value.toDate().toLocaleString(),
    width: 200,
  },
  {
    field: "Deltas",
    headerName: "Changes",
    valueGetter: ({ value }) => value.length,
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
      No notifications at the moment. Hopefully we find something for you soon.
    </Box>
  )
}
