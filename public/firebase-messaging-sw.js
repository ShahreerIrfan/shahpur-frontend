// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker.
firebase.initializeApp({
  apiKey: "AIzaSyAmQRigM30wIC45nH3rdEZdA1-7bX8uvHw",
  authDomain: "shahpur-da068.firebaseapp.com",
  projectId: "shahpur-da068",
  storageBucket: "shahpur-da068.firebasestorage.app",
  messagingSenderId: "669648771681",
  appId: "1:669648771681:web:0ea67d864ffb98e13d2820",
  measurementId: "G-37FWM600E7"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || "শাহপুর দরবার শরীফ";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: '/favicon.ico',
    image: payload.notification.image || undefined,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
