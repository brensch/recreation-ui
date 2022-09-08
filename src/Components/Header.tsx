import FaceIcon from "@mui/icons-material/Face"
import ManageSearchIcon from "@mui/icons-material/ManageSearch"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import SettingsIcon from "@mui/icons-material/Settings"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"

import { AppContext } from "../App"
import { ReactComponent as Logo } from "../logo.svg"

function TentIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <Logo />
    </SvgIcon>
  )
}

// const pages = ["explanation", "schniff"]

const Component = () => {
  let navigate = useNavigate()
  const appContext = useContext(AppContext)

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        color: "secondary.main",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <TentIcon sx={{ mr: 1 }} onClick={() => navigate("/")} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              // display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            SCHNIFFER
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}></Box>
          {appContext!.user ? (
            <React.Fragment>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Settings">
                  <IconButton
                    onClick={() => navigate("/schniff")}
                    sx={{ p: 0 }}
                  >
                    <ManageSearchIcon
                      sx={{ color: "secondary.light", display: "block", ml: 2 }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="See notifications">
                  <IconButton
                    onClick={() => navigate(`/notifications`)}
                    sx={{ p: 0 }}
                  >
                    <Badge
                      badgeContent={appContext?.notifications.length}
                      color="error"
                    >
                      <NotificationsNoneIcon
                        sx={{
                          color: "secondary.light",
                          display: "block",
                          ml: 2,
                        }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Settings">
                  <IconButton
                    onClick={() => navigate("/profile")}
                    sx={{ p: 0 }}
                  >
                    <SettingsIcon
                      sx={{ color: "secondary.light", display: "block", ml: 2 }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </React.Fragment>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton sx={{ p: 0 }}>
                <FaceIcon sx={{ my: 2, color: "primary", display: "block" }} />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Component
