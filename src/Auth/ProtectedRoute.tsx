import { User } from "firebase/auth"
import React, { createContext, useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppContext } from "../App"

export const UserContext = createContext<User | null>(null)

interface Props {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  let location = useLocation()
  const appContext = useContext(AppContext)

  return (
    <React.Fragment>
      {appContext!.user ? (
        children
      ) : (
        <Navigate replace to={`/signin?redirect=${location.pathname}`} />
      )}
    </React.Fragment>
  )
}
