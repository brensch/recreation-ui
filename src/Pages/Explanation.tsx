import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getAuth } from "firebase/auth"
import React, { useEffect } from "react"
import Grid from "@mui/material/Grid"
import Container from "@mui/material/Container"

export default () => {
  return (
    <Container
      maxWidth="xs"
      sx={{
        paddingTop: 2,
        display: "flex",
        flexDirection: "column",
        padding: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3">
            Explanation
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            component="h2"
            style={{ maxWidth: "600px" }}
          >
            If you're after a campground on a date that is currently fully
            booked, put Schniffer to work.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            component="h2"
            style={{ maxWidth: "600px" }}
          >
            As soon as someone cancels their existing reservation on a date
            you're interested in, Schniffer will send you a notification that an
            availability has opened up.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            component="h2"
            style={{ maxWidth: "600px" }}
          >
            Click on the notification and you'll see all the information about
            what we found, including links to view the newly available campsite
            and book.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {" "}
          <Typography
            variant="body1"
            component="h2"
            style={{ maxWidth: "600px" }}
          >
            The average time at popular campgrounds between availabilities
            appearing and them being booked again is about <b>15 minutes</b>. We
            will tell you within 2 minutes of it becoming available, the rest is
            up to you.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  )
}
