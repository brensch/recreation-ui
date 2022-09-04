import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import React from "react"
import { useNavigate } from "react-router-dom"
import useTitle from "../useTitle"

const Component = () => {
  let navigate = useNavigate()
  useTitle("")

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        paddingTop: 2,
        display: "flex",
        flexDirection: "column",
        "& .MuiTextField-root": { width: "100%" },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h2">
            Get reservations at fully booked campgrounds
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" component="h2">
            Tell the schniffer when and where you want to camp, and it'll tell
            you if a site becomes free.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Definition />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => {
              navigate("schniff")
            }}
          >
            Start schniffing!
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => {
              navigate("explanation")
            }}
          >
            Tell me more
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

const bull = <Box component="span">•</Box>

const Definition = () => {
  return (
    <Card
      sx={{
        backgroundColor: "#6F4E37",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          Schni{bull}ffer
        </Typography>
        <Typography sx={{ mb: 1.5 }}>noun</Typography>
        <Typography variant="body2">
          A service that scans (schniffs) for changes in campsite availability,
          and tells you when it finds what you want.
          <br />
          <br />
          <i>
            {
              '"Schniffer just schniffed  me out a campsite that was booked all summer!"'
            }
          </i>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default Component
