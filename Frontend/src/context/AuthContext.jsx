import { createContext, useContext, useState, useEffect } from "react";

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
    // Kyunki landing page par signup/login dono isi ek entry function se bind hain, 
    // hum check karenge ki name state exist karti hai ya nahi registration routing ke liye
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

  const loginWithGoogle = async () => {
    // Micro-mock link for frontend workflow validation
    const mockGoogleUser = { id: "goog_node", name: "Google Operator", email: "google.user@mesh.com" };
    localStorage.setItem("sehat_sathi_token", "G_MOCK_TOKEN");
    localStorage.setItem("sehat_sathi_user", JSON.stringify(mockGoogleUser));
    setUser(mockGoogleUser);
    return { success: true };
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