
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
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';




export default function SignIn() {
    const auth = getAuth();
    let navigate = useNavigate()
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false)
    const [signingInFromEmail, setSigningInFromEmail] = useState(false);

    const [loggedIn, setLoggedIn] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();
    let redirectTarget = searchParams.get("redirect")


    const redirect = () => {

        if (redirectTarget !== null) {
            navigate(redirectTarget)
            return
        }
        navigate("/")



    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => { // detaching the listener
            setLoggedIn(!!user)
            setCheckingStatus(false)
        });
        return () => unsubscribe(); // unsubscribing from the listener when the component is unmounting. 
    }, []);


    useEffect(() => {
        console.log(isSignInWithEmailLink(auth, window.location.href))
        if (isSignInWithEmailLink(auth, window.location.href)) {
            // this is used to stop the login page flashing up while the redirect takes its sweet arse time.
            setSigningInFromEmail(true)
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {

                redirect()
                return
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
                    return
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                })
                .catch((error) => {
                    console.log(error)
                    setError(error.toString())
                    setOpen(true)
                    // Some error occurred, you can inspect the code: error.code
                    // Common errors could be invalid email and invalid or expired OTPs.
                })
        }
    }, [])


    let target = `${window.location.origin}/signin${location.search}`
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
                console.log(errorMessage)
                setError(errorMessage)
                setOpen(true)
            })
            .finally(() => {
                setLoading(false)
            })


    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    if (checkingStatus) {

        return <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" component="h2" align={"center"} height={100}> Authorising.</Typography>
        </Box>
    }

    if (signingInFromEmail) {

        return <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" component="h2" align={"center"} height={100}> Logging you in.</Typography>
        </Box>
    }

    if (loggedIn) {
        redirect()
    }

    if (emailSent) {
        return <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" component="h2" align={"center"} height={100}> An email has been sent to you with a link to log in.</Typography>
        </Box>
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
                <Typography variant="h5" component="h2" align={"center"} height={100}> We need to know who you are to do this.</Typography>


                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
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

                </Box>
                <Typography variant="body1" component="h2" align={"center"} height={100}>Passwords and signing up are a pain. We email you a link to log in. It's easier this way trust me. </Typography>

            </Box>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}


const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});