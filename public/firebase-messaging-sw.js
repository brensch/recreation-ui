// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Am using version 8 because version 9 doesn't with typescript in the public folder
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js")

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCk41Er_X0TQFnq6UtEXFnM-WHuXmfTd2I",
  authDomain: "campr-app.firebaseapp.com",
  projectId: "campr-app",
  storageBucket: "campr-app.appspot.com",
  messagingSenderId: "763810810662",
  appId: "1:763810810662:web:0a7507e9a387792e364fe7",
  measurementId: "G-LPXZNQ11QL",
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  // Customize notification here
  const notificationTitle = payload.data.title
  const notificationOptions = {
    body: payload.data.body,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    icon: "./android-chrome-512x512.png",
    data: { url: payload.data.url },
    // actions: [{ action: "open_url", title: "View site" }],
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  )
})

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close()
    clients.openWindow(event.notification.data.url)
  },
  false,
)
