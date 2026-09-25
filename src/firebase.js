// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
//   appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);






// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcxU3MOq0slOPp6ckD_8l9-aelMEH24H4",
  authDomain: "autopulse-service-center.firebaseapp.com",
  databaseURL: "https://autopulse-service-center-default-rtdb.firebaseio.com",
  projectId: "autopulse-service-center",
  storageBucket: "autopulse-service-center.firebasestorage.app",
  messagingSenderId: "680593816404",
  appId: "1:680593816404:web:6e36d12710369b5cb326c1",
  measurementId: "G-G8DFJW8D55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);