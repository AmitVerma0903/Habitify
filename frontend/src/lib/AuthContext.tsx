import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "./api";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchUser();
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
