import { useEffect, useState } from "react";
import AuthContext from "./AuthContextValue";
import api from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem("access_token"));
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    api
      .get("/api/auth/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "access_token",
      response.data.access_token
    );

    const userResponse = await api.get("/api/auth/me");

    setUser(userResponse.data);
  };

  const register = async (fullName, email, password) => {
    await api.post("/api/auth/register", {
      full_name: fullName,
      email,
      password,
    });

    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}