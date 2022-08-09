import { getAuth } from "firebase/auth"
import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

export default () => {
  const auth = getAuth()

  useEffect(() => {
    auth.signOut()
  }, [])

  return <Navigate to="/" />
}
