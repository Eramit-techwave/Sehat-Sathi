import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const storedUser = localStorage.getItem("sehat_sathi_user");
    const storedToken = localStorage.getItem("sehat_sathi_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginWithEmail = async (email, password) => {
    return { success: false, error: "Pipeline migrating..." };
  };

  // role parameter added — sends to backend
  const registerNode = async (name, email, password, role = "Patient") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
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
      localStorage.setItem("sehat_sathi_token", data.token);
      localStorage.setItem("sehat_sathi_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const firebaseResult = await signInWithPopup(auth, googleProvider);
      const firebaseUser = firebaseResult.user;
      const realGooglePayload = {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        uid: firebaseUser.uid
      };
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(realGooglePayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "FastAPI Google pipeline mapping failed");
      localStorage.setItem("sehat_sathi_token", data.token);
      localStorage.setItem("sehat_sathi_user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("sehat_sathi_token");
    localStorage.removeItem("sehat_sathi_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginNode, registerNode, loginWithEmail, loginWithGoogle, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);