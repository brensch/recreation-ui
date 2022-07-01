
import React, { useEffect } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { CssBaseline } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Container from '@mui/material/Container';
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { DateRangePicker } from 'rsuite';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default () => {
    const auth = getAuth();
    const [value, setValue] = React.useState<Date | null>(null);

    return (
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h4" component="h2" align={"center"} >The rundown</Typography>
            <br />

            <Typography variant="body1" component="h2" align={"center"} >If you're after a campground on a date that is currently fully booked, put Schniffer to work.</Typography>
            <br />

            <Typography variant="body1" component="h2" align={"center"} > As soon as someone cancels their existing reservation on a date you're interested in, Schniffer will send you a notification that an availability has opened up.</Typography>
            <br />

            <Typography variant="body1" component="h2" align={"center"} > The notification will contain a link to book the site, jump on the website and book it before someone else does.</Typography>
            <br />
            <Typography variant="body1" component="h2" align={"center"} > The average time at popular campgrounds between availabilities appearing and them being booked again is about 15 minutes. We will tell you within 2 minutes of it becoming available, the rest is up to you.</Typography>

        </Box>
    );
}


