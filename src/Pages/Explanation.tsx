import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import React from "react"
import { useNavigate } from "react-router-dom"

const Component = () => {
  let navigate = useNavigate()

  return (
    <Container
      maxWidth="md"
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
          <Typography variant="body1" component="h2">
            If you're after a campground on a date that is currently fully
            booked, put Schniffer to work.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h2">
            As soon as someone cancels their existing reservation on a date
            you're interested in, Schniffer will send you a notification that an
            availability has opened up.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="h2">
            Click on the notification and you'll see all the information about
            what we found, including links to view the newly available campsite
            and book.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {" "}
          <Typography variant="body1" component="h2">
            The average time at popular campgrounds between someone cancelling a
            weekend reservation and it being booked again is about{" "}
            <b>15 minutes</b>. We will tell you within 2 minutes of it becoming
            available, the rest is up to you.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => {
              navigate("/schniff")
            }}
          >
            Start schniffing
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Component
