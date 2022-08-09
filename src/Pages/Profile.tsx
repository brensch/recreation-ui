import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { getAuth } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import React, { useEffect, useState } from "react"

import { db } from ".."

export default () => {
  const [pushbulletAPIKey, setPushbulletAPIKey] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  const auth = getAuth()

  const updateUserSettings = async () => {
    setLoading(true)

    await setDoc(doc(db, "users", auth.currentUser!.uid), {
      pushbullet: pushbulletAPIKey,
    })
    setLoading(false)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPushbulletAPIKey(event.target.value)
  }

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        padding: 1,
        spacing: 2,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        "& .MuiTextField-root": { m: 1, width: "100%" },
      }}
    >
      <Typography variant="body1" component="h2" align={"center"} height={100}>
        {auth.currentUser?.email}
      </Typography>

      <TextField
        id="campground-url"
        label="Pushbullet API Key"
        placeholder="Get this from pushbullet.com"
        variant="standard"
        value={pushbulletAPIKey}
        onChange={handleChange}
      />
      <Typography variant="body2" component="h2" align={"center"} height={100}>
        I recommend you set up pushbullet on your phone so you can receive
        notifications as soon as we schniff you a site.
      </Typography>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="secondary"
        disabled={loading}
        onClick={() => updateUserSettings()}
        sx={{ m: 1 }}
      >
        Submit
      </Button>
    </Container>
  )
}
