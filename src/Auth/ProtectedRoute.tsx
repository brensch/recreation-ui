import { getAuth } from "firebase/auth"
import React, { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"

interface Props {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const auth = getAuth()
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  let location = useLocation()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // detaching the listener
      if (user) {
        setLoggedIn(true)
      } else {
        setLoggedIn(false)

        // No user is signed in...code to handle unauthenticated users.
      }
      setCheckingStatus(false)
    })
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [])

  return (
    <>
      {
        // display a spinner while auth status being checked
        checkingStatus ? (
          <div>spinno</div>
        ) : loggedIn ? (
          // if user is logged in, grant the access to the route
          // note: in this example component is Bar
          children
        ) : (
          // else render an unauthorised component
          // stating the reason why it cannot access the route
          <Navigate replace to={`/signin?redirect=${location.pathname}`} />
        )
      }
    </>
  )
}
