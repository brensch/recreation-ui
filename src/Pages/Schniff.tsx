import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { doc, setDoc } from "firebase/firestore";
import { db } from '..';
import { getAuth } from 'firebase/auth';


export default () => {
    const [groundID, setGroundID] = useState<string | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    let auth = getAuth()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGroundID(event.target.value);
    };

    function getDates(startDate: Date, stopDate: Date) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    }

    const submitSchniffRequest = async () => {
        // if (start === null || end === null) {
        //     return
        // }

        await setDoc(doc(db, "users", auth.currentUser!.uid), {
            name: "Los Angeles",
            state: "CA",
            country: "USA"
        })
        // console.log(getDates(start, end))
    }

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


            <TextField
                id="campground-url"
                label="recreation.gov campground URL"
                placeholder="eg: https://www.recreation.gov/camping/campgrounds/232450"
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
                onClick={() => submitSchniffRequest()}
                sx={{ m: 1 }}
            >
                Schniff
            </Button>

            {/* </Box> */}
        </Container>
    );
}

// https://