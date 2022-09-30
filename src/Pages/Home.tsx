import { Link } from "@mui/material"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import SvgIcon from "@mui/material/SvgIcon"
import Typography from "@mui/material/Typography"
import React from "react"
import { useNavigate } from "react-router-dom"
import TextField from "@mui/material/TextField"

import { ReactComponent as Book } from "../Assets/book.svg"
import { ReactComponent as Nose } from "../Assets/nose.svg"
import { ReactComponent as SMS } from "../Assets/sms.svg"
import useTitle from "../useTitle"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import SearchIcon from "@mui/icons-material/Search"

const Component = () => {
  useTitle("")
  let navigate = useNavigate()

  return (
    <Box sx={{ width: "100%" }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          margin: "#222222",
          "& .MuiTextField-root": { width: "100%" },
        }}
      >
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  aria-label="search icon"
                  // onClick={handleClickShowPassword}
                  // onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          placeholder="Find your next adventure"
          variant="standard"
          onClick={() => navigate("/search")}
        />
      </Container>{" "}
      <Container
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          margin: "#222222",
          padding: 5,
          "& .MuiTextField-root": { width: "100%" },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h2">
              <b>Get reservations at fully booked campgrounds</b>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              Tell Schniffer when and where you want to camp, and it'll tell you
              if a site becomes free.
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ width: "100%", backgroundColor: "#d5ab9e" }}>
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
              <Typography variant="h5" component="h2">
                <b>How does it work?</b>
              </Typography>
            </Grid>
            <Grid item md={4} xs={12}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: 5,
                  height: 200,
                }}
              >
                <Container
                  onClick={() => navigate("/schniff")}
                  component="main"
                  maxWidth="md"
                  sx={{
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    "& .MuiGrid-root": {
                      padding: 1,
                    },
                    "& .MuiTypography-root": {
                      textAlign: "center",
                    },
                  }}
                >
                  <Grid item xs={12} alignItems="center">
                    <SvgIcon>
                      <Nose />
                    </SvgIcon>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5">Create a schniff</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Tell Schniffer when and where you're trying to camp
                    </Typography>
                  </Grid>
                </Container>
              </Card>
            </Grid>
            <Grid item md={4} xs={12}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: 5,
                  height: 200,
                }}
              >
                <Container
                  component="main"
                  maxWidth="md"
                  sx={{
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    "& .MuiGrid-root": {
                      padding: 1,
                    },
                    "& .MuiTypography-root": {
                      textAlign: "center",
                    },
                  }}
                >
                  <Grid item xs={12} alignItems="center">
                    <SvgIcon>
                      <SMS />
                    </SvgIcon>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5">Get Notified</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Schniffer will tell you if a site becomes free
                    </Typography>
                  </Grid>
                </Container>
              </Card>
            </Grid>
            <Grid item md={4} xs={12}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: 5,
                  height: 200,
                }}
              >
                <Container
                  component="main"
                  maxWidth="md"
                  sx={{
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    "& .MuiGrid-root": {
                      padding: 1,
                    },
                    "& .MuiTypography-root": {
                      textAlign: "center",
                    },
                  }}
                >
                  <Grid item xs={12} alignItems="center">
                    <SvgIcon>
                      <Book />
                    </SvgIcon>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5">Book!</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Follow the link in your notification to book the site.
                    </Typography>
                  </Grid>
                </Container>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
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
              <b>Ready to schniff?</b>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Link
              variant="h6"
              component="h2"
              onClick={() => navigate("/schniff")}
            >
              Let's get this bread.
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Component
