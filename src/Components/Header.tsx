import ManageSearchIcon from "@mui/icons-material/ManageSearch"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import SettingsIcon from "@mui/icons-material/Settings"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import React, { useContext, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import MenuIcon from "@mui/icons-material/Menu"
import { AppContext } from "../App"
import { ReactComponent as Tent } from "../Assets/tent.svg"
import Drawer from "@mui/material/Drawer"
import SvgIcon from "@mui/material/SvgIcon"
import LogoutIcon from "@mui/icons-material/Logout"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import InboxIcon from "@mui/icons-material/MoveToInbox"
import MailIcon from "@mui/icons-material/Mail"
import AddIcon from "@mui/icons-material/Add"
import { ReactComponent as Nose } from "../Assets/nose.svg"

const Component = () => {
  let navigate = useNavigate()
  let location = useLocation()
  const [drawer, setDrawer] = useState(false)

  const appContext = useContext(AppContext)

  return (
    <React.Fragment>
      <AppBar position="static" elevation={0} color="transparent">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* <TentIcon sx={{ mr: 1 }} onClick={() => navigate("/")} /> */}
            <Tent
              height={30}
              width={30}
              style={{ marginRight: 10 }}
              onClick={() => navigate("/")}
            />

            <Typography
              variant="h5"
              noWrap
              component="a"
              onClick={() => navigate("/")}
              sx={{
                // display: { xs: "flex", md: "none" },
                flexGrow: 1,
                // fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              SCHNIFFER
            </Typography>
            {appContext?.user && (
              <React.Fragment>
                <Box
                  sx={{
                    flexGrow: 0,
                  }}
                >
                  <Tooltip title="See notifications">
                    <IconButton
                      onClick={() => navigate(`/notifications`)}
                      sx={{ color: "inherit" }}
                    >
                      <Badge
                        badgeContent={appContext?.notifications.length}
                        color="error"
                      >
                        <NotificationsNoneIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    flexGrow: 0,
                    borderBottom: location.pathname.startsWith("/schniff")
                      ? 2
                      : 0,
                  }}
                >
                  <Tooltip title="Menu">
                    <IconButton
                      onClick={() => setDrawer(true)}
                      sx={{ color: "inherit" }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </React.Fragment>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawer(false)}
        >
          <List>
            <ListItem key={"search"} disablePadding>
              <ListItemButton onClick={() => navigate("/search")}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={"New Schniff"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={"schniffs"} disablePadding>
              <ListItemButton onClick={() => navigate("/schniff")}>
                <ListItemIcon>
                  <SvgIcon>
                    <Nose />
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText primary={"Your Schniffs"} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem key={"settings"} disablePadding>
              <ListItemButton onClick={() => navigate("/profile")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={"signout"} disablePadding>
              <ListItemButton onClick={() => navigate("/signout")}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={"Log Out"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </React.Fragment>
  )
}

export default Component
