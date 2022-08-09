import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { getAuth } from "firebase/auth"
import React, { useEffect } from "react"

export default () => {
  const auth = getAuth()
  const [value, setValue] = React.useState<Date | null>(null)

  return (
    <Container component="main" maxWidth="xs">
      Secrets
      {auth.currentUser?.email}
      <DatePicker
        label="Basic example"
        value={value}
        onChange={(newValue) => {
          setValue(newValue)
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <Button
        onClick={() => {
          auth.signOut()
        }}
      >
        lumb
      </Button>
    </Container>
  )
}
