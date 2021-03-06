import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const pages = ['search', 'monitor'];
const settings = ['profile', 'signout'];

export default () => {
    let navigate = useNavigate()

    // todo, move this to a context so i don't have to have 2 watchers. lazy.
    const auth = getAuth();
    const [loggedIn, setLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => { // detaching the listener
            if (user) {
                // ...your code to handle authenticated users. 
                setLoggedIn(true)
            } else {
                setLoggedIn(false)

                // No user is signed in...code to handle unauthenticated users. 
            }
            setCheckingStatus(false)
        });
        return () => unsubscribe(); // unsubscribing from the listener when the component is unmounting. 
    }, []);

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static"
            sx={{
                color: 'secondary.main',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters >
                    <HolidayVillageIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'secondary.main',
                            textDecoration: 'none',
                        }}
                    >
                        SCHNIFFER
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={() => {
                                    navigate(page)
                                    handleCloseNavMenu()
                                }
                                }>
                                    <Typography textAlign="center" color={"secondary.main"}>{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <HolidayVillageIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SCHNIFFER
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={() => {
                                    navigate(page)
                                    handleCloseNavMenu()
                                }}
                                sx={{ my: 2, color: 'secondary.light', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>
                    {loggedIn ?
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <FaceIcon sx={{ my: 2, color: 'secondary.light', display: 'block' }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center" onClick={() => {
                                            navigate(setting)
                                            handleCloseNavMenu()
                                        }}>{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box> : <Box sx={{ flexGrow: 0 }}>
                            <IconButton sx={{ p: 0 }} >
                                <FaceIcon sx={{ my: 2, color: 'primary', display: 'block' }}></FaceIcon>
                            </IconButton>
                        </Box>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
};
