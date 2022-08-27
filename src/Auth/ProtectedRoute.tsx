import { getAuth, User } from "firebase/auth"
import React, { useEffect, useState, createContext } from "react"
import { Navigate, useLocation } from "react-router-dom"

export const UserContext = createContext<User | null>(null)

interface Props {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const auth = getAuth()
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  let location = useLocation()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      console.log(newUser)
      // detaching the listener
      if (newUser) {
        setLoggedIn(true)
        setUser(newUser)
      } else {
        setLoggedIn(false)
      }
      setCheckingStatus(false)
    })
    return () => unsubscribe() // unsubscribing from the listener when the component is unmounting.
  }, [auth])

  return (
    <UserContext.Provider value={user}>
      {
        // display a spinner while auth status being checked
        checkingStatus ? (
          <div>spinno</div>
        ) : loggedIn ? (
          // if user is logged in, grant the access to the route
          children
        ) : (
          // else render an unauthorised component
          <Navigate replace to={`/signin?redirect=${location.pathname}`} />
        )
      }
    </UserContext.Provider>
  )
}
