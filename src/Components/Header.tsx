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
import { useLocation, useNavigate } from "react-router-dom"

import { AppContext } from "../App"
import { ReactComponent as Logo } from "../logo.svg"

function TentIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <Logo />
    </SvgIcon>
  )
}

const Component = () => {
  let navigate = useNavigate()
  let location = useLocation()

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

          {appContext!.user && (
            <React.Fragment>
              <Box
                sx={{
                  flexGrow: 0,
                  borderBottom: location.pathname.startsWith("/schniff")
                    ? 2
                    : 0,
                }}
              >
                <Tooltip title="Settings">
                  <IconButton onClick={() => navigate("/schniff")} sx={{}}>
                    <ManageSearchIcon sx={{ color: "secondary.light" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  flexGrow: 0,
                  borderBottom: location.pathname.startsWith("/notifications")
                    ? 2
                    : 0,
                }}
              >
                <Tooltip title="See notifications">
                  <IconButton
                    onClick={() => navigate(`/notifications`)}
                    sx={{ p: 1 }}
                  >
                    <Badge
                      badgeContent={appContext?.notifications.length}
                      color="error"
                    >
                      <NotificationsNoneIcon
                        sx={{
                          color: "secondary.light",
                          display: "block",
                        }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  flexGrow: 0,
                  borderBottom: location.pathname.startsWith("/profile")
                    ? 2
                    : 0,
                }}
              >
                <Tooltip title="Settings">
                  <IconButton
                    onClick={() => navigate("/profile")}
                    sx={{ p: 1 }}
                  >
                    <SettingsIcon sx={{ color: "secondary.light" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </React.Fragment>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Component
