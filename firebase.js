/* ==========================================
   Expense Hub
   Firebase Configuration
========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
// YAHAN CHANGE: GoogleAuthProvider ko bhi import kiya hai
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/* ==========================================
   Firebase Config
========================================== */

const firebaseConfig = {
    apiKey: "AIzaSyB8wb9VxDKLW_mycii1uDOpqtz2V5d4f70",
    authDomain: "extensehub.firebaseapp.com",
    databaseURL: "https://extensehub-default-rtdb.firebaseio.com",
    projectId: "extensehub",
    storageBucket: "extensehub.firebasestorage.app",
    messagingSenderId: "906888233436",
    appId: "1:906888233436:web:861367fd0b714ff570cf19"
};

/* ==========================================
   Initialize Firebase
========================================== */

const app = initializeApp(firebaseConfig);

/* ==========================================
   Export Services
========================================== */

export const auth = getAuth(app);
export const database = getDatabase(app); 

// YAHAN NAYA ADD KIYA: Google Provider ka instance bana kar export kiya
export const googleProvider = new GoogleAuthProvider();