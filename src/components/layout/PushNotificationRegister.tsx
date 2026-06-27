'use client';

import { useEffect } from "react";

export default function PushNotificationRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("Notification" in window)
    ) {
      return;
    }

    const registerNotification = async () => {
      try {
        // 1. Request Permission from user
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission not granted.");
          return;
        }

        // 2. Dynamically import Firebase libraries (client-side only)
        const { initializeApp } = await import("firebase/app");
        const { getMessaging, getToken, onMessage } = await import("firebase/messaging");

        const firebaseConfig = {
          apiKey: "AIzaSyAmQRigM30wIC45nH3rdEZdA1-7bX8uvHw",
          authDomain: "shahpur-da068.firebaseapp.com",
          projectId: "shahpur-da068",
          storageBucket: "shahpur-da068.firebasestorage.app",
          messagingSenderId: "669648771681",
          appId: "1:669648771681:web:0ea67d864ffb98e13d2820",
          measurementId: "G-37FWM600E7"
        };

        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // 3. Retrieve FCM Token
        // NEXT_PUBLIC_FIREBASE_VAPID_KEY can be added to your env. If not set, it dispatches using standard protocols.
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined
        });

        if (token) {
          console.log("FCM Browser Token registered:", token);
          
          // 4. Send token to Django API
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
          await fetch(`${API_URL}/core/register-device/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              token: token,
              platform: "web"
            })
          });
        }

        // 5. Handle foreground notification delivery
        onMessage(messaging, (payload) => {
          console.log("Foreground push notification received:", payload);
          if (payload.notification) {
            new Notification(payload.notification.title || "শাহপুর দরবার শরীফ", {
              body: payload.notification.body,
              icon: "/favicon.ico",
              image: payload.notification.image
            } as any);
          }
        });

      } catch (error) {
        console.error("Error setting up Firebase Push Notifications:", error);
      }
    };

    // Delay registration by 2 seconds to not block core page load rendering
    const timer = setTimeout(() => {
      registerNotification();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
