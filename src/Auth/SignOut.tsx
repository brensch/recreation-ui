import { getAuth } from "firebase/auth"
import React, { useEffect } from "react"
import { Navigate } from "react-router-dom"

const Component = () => {
  const auth = getAuth()

  useEffect(() => {
    auth.signOut()
  }, [auth])

  return <Navigate to="/" />
}

export default Component
