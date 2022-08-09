import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { getAuth } from "firebase/auth"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import React, { useEffect, useState } from "react"

import { db } from ".."

export default () => {
  const [groundID, setGroundID] = useState<string | null>(null)
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  let auth = getAuth()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroundID(event.target.value)
  }

  function getDates(startDate: Date, stopDate: Date) {
    var dateArray = new Array()
    var currentDate = startDate
    while (currentDate <= stopDate) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dateArray
  }

  const submitSchniffRequest = () => {
    let docID = `${auth.currentUser!.uid}/schniffs/send`

    if (!start || !end) {
      return
    }
    setLoading(true)

    // setDoc(doc(db, "monitor_requests", docID), {
    addDoc(collection(db, "monitor_requests"), {
      Dates: getDates(start, end),
      Ground: groundID,
      Notifier: {
        NotificationToken: "o.gMQajO2iSWtnlJpUBdXDl55CRO9UNhLw",
        Username: "brend",
      },
    })
      .then(() => {})
      .finally(() => {
        setLoading(false)
      })
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
          setStart(newValue)
        }}
        renderInput={(params) => <TextField variant="standard" {...params} />}
      />
      <DatePicker
        label="End date"
        value={end}
        onChange={(newValue) => {
          setEnd(newValue)
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
  )
}

// https://
