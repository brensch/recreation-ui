import DoneAllIcon from "@mui/icons-material/DoneAll"
import { IconButton, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { Stack } from "@mui/system"
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import { FirebaseError } from "firebase/app"
import { doc, writeBatch } from "firebase/firestore"
import React, { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"

import { db } from ".."
import { AppContext, Notification } from "../App"
import useTitle from "../useTitle"

const Component = () => {
  const appContext = useContext(AppContext)
  const [acking, setAcking] = useState<boolean>(false)

  let navigate = useNavigate()

  useTitle("notifications")

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
      .catch((err: FirebaseError) => {
        appContext?.fireAlert("error", err.message)
      })
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
          <Stack direction="row">
            <Typography variant="h5" component="h3" sx={{ flex: 1 }}>
              <b>Notifications</b>
            </Typography>
            <IconButton onClick={ackAllsNotification} disabled={acking}>
              <DoneAllIcon />
            </IconButton>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            autoHeight
            rows={appContext!.notifications}
            columns={columns}
            // hideFooterPagination
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
    valueGetter: (params) => {
      let notification: Notification = params.row
      return notification.MonitorRequestProcs.length
    },
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

export default Component
