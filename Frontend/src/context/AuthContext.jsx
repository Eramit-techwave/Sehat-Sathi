import { createContext, useContext, useState, useEffect } from "react";
// 🔒 Firebase integration modules import kiye
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛰️ SERVER ENDPOINT BASE URL
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    // Session persistent check: Browser reload par bhi session locked rahega
    const storedUser = localStorage.getItem("sehat_sathi_user");
    const storedToken = localStorage.getItem("sehat_sathi_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 📝 REAL API ACTION: USER SIGNUP
  const loginWithEmail = async (email, password) => {
    return { success: false, error: "Pipeline migrating..." };
  };

  // 🚀 REAL REFACTORED METHOD MODULES
  const registerNode = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Signup failed");
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginNode = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Invalid Email or Password");
      
      // Token aur session details browser local storage me save karna
      localStorage.setItem("sehat_sathi_token", data.token);
      localStorage.setItem("sehat_sathi_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 🌐 100% REAL REFACTORED METHOD: GOOGLE AUTH WITH FIREBASE
  const loginWithGoogle = async () => {
    try {
      console.log("🚀 Initializing Real Google Auth Firebase Handshake...");
      
      // 1. Firebase pop-up open karke real Google user data fetch karna
      const firebaseResult = await signInWithPopup(auth, googleProvider);
      const firebaseUser = firebaseResult.user;

      const realGooglePayload = {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        uid: firebaseUser.uid
      };

      console.log("📥 Real Google Data Received: ", realGooglePayload);

      // 2. Data ko FastAPI backend pipeline me hit karwana
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(realGooglePayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "FastAPI Google pipeline mapping failed");

      // 3. Real secure backend token aur user session browser me register karna
      localStorage.setItem("sehat_sathi_token", data.token);
      localStorage.setItem("sehat_sathi_user", JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (err) {
      console.error("❌ Google Auth Error Details: ", err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("sehat_sathi_token");
    localStorage.removeItem("sehat_sathi_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginNode, registerNode, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);