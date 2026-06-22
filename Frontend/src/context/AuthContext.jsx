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
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("sehat_sathi_user");
        localStorage.removeItem("sehat_sathi_token");
      }
    }
    setLoading(false);
  }, []);

  // Email + Password Login
  const loginWithEmail = async (email, password) => {
    return loginNode(email, password);
  };

  // Register new user with role (and optional professional fields)
  const registerNode = async (
    name,
    email,
    password,
    role = "Patient",
    phone = null,
    medical_reg_number = undefined,
    registration_number = undefined
  ) => {
    try {
      const payload = { name, email, password, role, phone };
      if (medical_reg_number) payload.medical_reg_number = medical_reg_number;
      if (registration_number) payload.registration_number = registration_number;

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Signup failed");
      return {
        success: true,
        message: data.message,
        verification_required: data.verification_required || false,
        verification_status: data.verification_status || "approved"
      };
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
      return { success: true, verification_status: data.user.verification_status };
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

  // Helper: check if current user is verified (for Doctor/Hospital role gate)
  const isVerified = () => {
    if (!user) return false;
    if (user.role === "Patient" || user.role === "Admin") return true;
    return user.verification_status === "approved";
  };

  // Get stored JWT token
  const getToken = () => localStorage.getItem("sehat_sathi_token");

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginNode,
      loginWithEmail,
      registerNode,
      loginWithGoogle,
      resetPassword,
      logout,
      isVerified,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);