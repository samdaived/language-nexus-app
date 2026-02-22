import React, { createContext, useContext, useState } from "react";
import { User, UserRole } from "@/types";
import { MOCK_USERS } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, userId?: string) => {
    const found = userId
      ? MOCK_USERS.find((u) => u.id === userId)
      : MOCK_USERS.find((u) => u.role === role);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
