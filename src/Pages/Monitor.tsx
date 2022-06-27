import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default () => {
    const [groundID, setGroundID] = useState<string | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGroundID(event.target.value);
    };

    return (
        <Container component="main" maxWidth="sm" sx={{
            padding: 1,
            spacing: 2,
            display: 'flex',
            alignItems: 'center',
            flexDirection: "column",
            '& .MuiTextField-root': { m: 1, width: '100%' },
        }}>
            {/* <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '100%' },
                }}
                noValidate
                autoComplete="off"
            > */}
            <Typography variant="body2" component="h2" align={"center"} height={100}> Find the campsite you want on recreation.gov.<br />The number we need is what's after 'campgrounds' in the URL.<br />For example: <Link href="https://www.recreation.gov/camping/campgrounds/232450" target="_blank">www.recreation.gov/camping/campgrounds/<b><i>232450</i></b></Link></Typography>

            <TextField
                id="campground-url"
                label="Campground ID"
                placeholder="Get this from recreation.gov"
                value={groundID}
                onChange={handleChange}
                variant="standard"
            />
            <DatePicker
                label="Start date"
                value={start}
                onChange={(newValue) => {
                    setStart(newValue);
                }}
                renderInput={(params) => <TextField variant="standard" {...params} />}
            />
            <DatePicker
                label="End date"
                value={end}
                onChange={(newValue) => {
                    setEnd(newValue);
                }}
                renderInput={(params) => <TextField variant="standard" {...params} />}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                disabled={loading}
                sx={{ m: 1 }}
            >
                Monitor
            </Button>

            <Typography variant="body2" component="h2" align={"center"} height={100}> Note I will do this so you can search campgrounds from in here soon.</Typography>

            {/* </Box> */}
        </Container>
    );
}

// https://