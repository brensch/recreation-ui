import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default () => {
  let navigate = useNavigate()

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        padding: 1,
        spacing: 2,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" component="h2" align={"center"}>
        Reserving campsites in the US is hard
      </Typography>
      <br />
      <br />
      <Typography variant="h5" component="h2" align={"center"}>
        {" "}
        We're here to help
      </Typography>
      <br />
      <br />

      <Definition />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="secondary"
        onClick={() => {
          navigate("schniff")
        }}
        sx={{
          m: 1,
          maxWidth: 400,
        }}
      >
        Start schniffing!
      </Button>
    </Container>
  )
}

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
)

const Definition = () => {
  let navigate = useNavigate()
  return (
    <Card
      sx={{
        maxWidth: 400,
        backgroundColor: "#6F4E37",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          Schni{bull}ffer
        </Typography>
        <Typography sx={{ mb: 1.5 }}>noun</Typography>
        <Typography variant="body2">
          A service that monitors (schniffs) for changes in campsite
          availability, and tells you when it finds what you want.
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

const Quotes = () => {
  return (
    <Card
      sx={{
        // maxWidth: 300,
        backgroundColor: "#6F4E37",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div" align="right" height={50}>
          Reviews
        </Typography>

        <Typography sx={{ mb: 1.5 }} align="right">
          "It is nice." <br />
          <i>Skye</i>
        </Typography>
        <Typography sx={{ mb: 1.5 }} align="right">
          "I might try it if you get it to work." <br />
          <i>Ben</i>
        </Typography>
      </CardContent>
    </Card>
  )
}
