import { initializeApp } from "@angular/fire/app";
import { getAuth } from "firebase/auth";

export const environment = {
    production: false,
    firebaseConfig: {
    apiKey: "AIzaSyBmpnkFfdN1n2bY_sEvlw-vuROF56Sy3hw",
    authDomain: "ezz-web-note.firebaseapp.com",
    projectId: "ezz-web-note",
    storageBucket: "ezz-web-note.firebasestorage.app",
    messagingSenderId: "399678330607",
    appId: "1:399678330607:web:f6d88884587ad5d13b6d1a",
    measurementId: "G-364X84P9V8"
    },
  };
  // const app = initializeApp(environment.firebaseConfig);
// export const auth = getAuth(app);