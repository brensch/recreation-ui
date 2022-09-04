import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getMessaging } from "firebase/messaging"
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"

import App from "./App"
import reportWebVitals from "./reportWebVitals"

const firebaseConfig = {
  apiKey: "AIzaSyCk41Er_X0TQFnq6UtEXFnM-WHuXmfTd2I",
  authDomain: "campr-app.firebaseapp.com",
  projectId: "campr-app",
  storageBucket: "campr-app.appspot.com",
  messagingSenderId: "763810810662",
  appId: "1:763810810662:web:0a7507e9a387792e364fe7",
  measurementId: "G-LPXZNQ11QL",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const messaging = getMessaging(app)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <App />
      </Router>
    </LocalizationProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
