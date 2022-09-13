import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import React from "react"

import useTitle from "../useTitle"

const Component = () => {
  useTitle("Payment Complete")

  return (
    <Box sx={{ width: "100%" }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          margin: "#222222",
          padding: 5,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h2">
              <b>Thank you</b>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              That is very nice.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Component
