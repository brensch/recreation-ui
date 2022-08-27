import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getAuth } from "firebase/auth"
import React, { useEffect } from "react"

export default () => {
  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Typography variant="h4" component="h2">
        The rundown
      </Typography>
      <br />

      <Typography variant="body1" component="h2" style={{ maxWidth: "600px" }}>
        If you're after a campground on a date that is currently fully booked,
        put Schniffer to work.
      </Typography>
      <br />

      <Typography variant="body1" component="h2" style={{ maxWidth: "600px" }}>
        {" "}
        As soon as someone cancels their existing reservation on a date you're
        interested in, Schniffer will send you a notification that an
        availability has opened up.
      </Typography>
      <br />

      <Typography variant="body1" component="h2" style={{ maxWidth: "600px" }}>
        {" "}
        The notification will contain a link to book the site, jump on the
        website and book it before someone else does.
      </Typography>
      <br />
      <Typography variant="body1" component="h2" style={{ maxWidth: "600px" }}>
        {" "}
        The average time at popular campgrounds between availabilities appearing
        and them being booked again is about 15 minutes. We will tell you within
        2 minutes of it becoming available, the rest is up to you.
      </Typography>
    </Box>
  )
}
