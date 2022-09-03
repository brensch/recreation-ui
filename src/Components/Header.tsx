import FaceIcon from "@mui/icons-material/Face"
import MenuIcon from "@mui/icons-material/Menu"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"

import { AppContext } from "../App"
import { ReactComponent as Logo } from "../logo.svg"

// import TentIcon from '@mui/icons-material/HolidayVillage';
function TentIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <Logo />
    </SvgIcon>
  )
}

const pages = ["explanation", "schniff"]
const settings = ["profile", "signout"]

const Component = () => {
  let navigate = useNavigate()
  const appContext = useContext(AppContext)

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  )

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

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
          <TentIcon
            sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
            onClick={() => navigate("/")}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={() => navigate("/")}
            // href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "secondary.main",
              textDecoration: "none",
            }}
          >
            SCHNIFFER
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="secondary"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => {
                    navigate(page)
                    handleCloseNavMenu()
                  }}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <TentIcon
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
            onClick={() => navigate("/")}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
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
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  navigate(page)
                  handleCloseNavMenu()
                }}
                sx={{ my: 2, color: "secondary.light", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>
          {appContext!.user ? (
            <React.Fragment>
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
                        }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <FaceIcon
                      sx={{ color: "secondary.light", display: "block", ml: 2 }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                      <Typography
                        textAlign="center"
                        onClick={() => {
                          navigate(setting)
                          handleCloseNavMenu()
                        }}
                      >
                        {setting}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
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
