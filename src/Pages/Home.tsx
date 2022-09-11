import { Link } from "@mui/material"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import SvgIcon from "@mui/material/SvgIcon"
import Typography from "@mui/material/Typography"
import React from "react"
import { useNavigate } from "react-router-dom"

import { ReactComponent as Book } from "../Assets/book.svg"
import { ReactComponent as Nose } from "../Assets/nose.svg"
import { ReactComponent as SMS } from "../Assets/sms.svg"
import useTitle from "../useTitle"

const Component = () => {
  let navigate = useNavigate()
  useTitle("")

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
      <Box sx={{ width: "100%", backgroundColor: "#222222" }}>
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
              <Typography variant="h4" component="h2" sx={{ color: "#FFFFFF" }}>
                <b>How does it work?</b>
              </Typography>
            </Grid>
            <Grid item md={4} xs={12}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: 5,
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
                    <Typography variant="h5">Get an SMS</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      Schniffer will send you an SMS if a site becomes free
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
