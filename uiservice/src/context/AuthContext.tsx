import React from "react";
import { createContext, useContext, useState } from "react";
import API from "../services/api";

type AuthType = {
  token: string | null;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async (phone: string) => {
    try {
      setIsLoading(true);
      const res = await API.post("/auth/sendotp", { phone });
      console.log("OTP sent successfully:", res.data);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const res = await API.post("/auth/verifyotp", { phone, otp });
      console.log("OTP verified successfully:", res.data);
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const res = await API.post("/login/verifyOtp", { phone, otp });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      console.log("Login successful");
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, sendOtp, verifyOtp, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
