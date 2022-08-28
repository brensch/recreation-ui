import DeleteIcon from "@mui/icons-material/Delete"
import InfoIcon from "@mui/icons-material/Info"
import InsertLinkIcon from "@mui/icons-material/InsertLink"
import ShareIcon from "@mui/icons-material/Share"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid"
import { deleteDoc, doc } from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { AppContext, Notification } from "../App"
import { useNavigate } from "react-router-dom"

export default () => {
  const appContext = useContext(AppContext)
  let navigate = useNavigate()

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "Created",
      sort: "desc" as GridSortDirection,
    },
  ])
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        paddingTop: 2,
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