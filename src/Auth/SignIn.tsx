
import React, { useEffect, useState } from 'react';

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
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';





export default function SignIn() {
    const auth = getAuth();
    let navigate = useNavigate()
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false)

    const [loggedIn, setLoggedIn] = useState(false);

    let location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();


    const redirect = () => {
        let target = searchParams.get("redirect")
        console.log(target)
        if (target !== null) {
            navigate(target)
        }

    }

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


    useEffect(() => {
        console.log(isSignInWithEmailLink(auth, window.location.href))
        if (isSignInWithEmailLink(auth, window.location.href)) {
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {

                redirect()
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                // email = window.prompt('You must log in from the same device you started the process on');
            }
            // The client SDK will parse the code from the link for you.
            signInWithEmailLink(auth, email!, window.location.href)
                .then((result) => {
                    // Clear email from storage.
                    window.localStorage.removeItem('emailForSignIn');
                    console.log(result)
                    redirect()
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                })
                .catch((error) => {
                    console.log(error)
                    // Some error occurred, you can inspect the code: error.code
                    // Common errors could be invalid email and invalid or expired OTPs.
                })
                .finally(() => {
                    setCheckingStatus(false)
                })
        }
    }, [])

    console.log(location.search)
    let target = `http://localhost:3000/signin${location.search}`
    const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: target,
        // This must be true.
        handleCodeInApp: true,
        // iOS: {
        //     bundleId: 'com.example.ios'
        // },
        // android: {
        //     packageName: 'com.example.android',
        //     installApp: true,
        //     minimumVersion: '12'
        // },
        // dynamicLinkDomain: 'localhost'
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
        });

        if (data.get('email') === null) {
            console.log("gaf")
            return
        }
        let email = data.get('email')!.toString()
        console.log(email)

        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                // The link was successfully sent. Inform the user.
                // Save the email locally so you don't need to ask the user for it again
                // if they open the link on the same device.
                console.log("yo")
                window.localStorage.setItem('emailForSignIn', email);
                setEmailSent(true)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error)
            })
            .finally(() => {
                setLoading(false)
            })

        console.log("sent email")

    };

    if (checkingStatus) {
        return <div>Authorising</div>
    }



    if (loggedIn) {
        redirect()
    }

    if (emailSent) {
        return <div>Email sent. Click link to log in.</div>
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Schniffer
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="#" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}


