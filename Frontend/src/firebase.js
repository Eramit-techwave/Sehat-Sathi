import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 🔑 Tumhara real Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDu7o2wV1E_iaOtFOutPsXWEJXWPU0N5fU",
  authDomain: "sehat-sathi-23e65.firebaseapp.com",
  projectId: "sehat-sathi-23e65",
  storageBucket: "sehat-sathi-23e65.firebasestorage.app",
  messagingSenderId: "42983657635",
  appId: "1:42983657635:web:3d32af8c6e9bb21d42ef16",
  measurementId: "G-YSJHB12YTK"
};

// 🚀 Initialize Firebase Engine
const app = initializeApp(firebaseConfig);

// 🔒 Setup Services Instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Auth Prompt me hamesha account select karne ka option dikhane ke liye setting
googleProvider.setCustomParameters({ prompt: 'select_account' });