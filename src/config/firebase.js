// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9LVXj9P4tj-E_jP-HGEn_WzoqECoxXMo",
  authDomain: "sagradago-48104.firebaseapp.com",
  projectId: "sagradago-48104",
  storageBucket: "sagradago-48104.firebasestorage.app",
  messagingSenderId: "850523414151",
  appId: "1:850523414151:web:36fe6c90f05b83a1c26222",
  measurementId: "G-055S9B1TYN"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)