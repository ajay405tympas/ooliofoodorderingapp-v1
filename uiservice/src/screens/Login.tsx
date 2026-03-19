import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone"); // phone entry or OTP entry
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { sendOtp, verifyOtp, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Please enter a valid phone number");
      return;
    }
    try {
      setError("");
      setMessage("");
      await sendOtp(phone);
      setMessage("OTP sent successfully! Check your phone.");
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyAndLogin = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }
    try {
      setError("");
      setMessage("");
      
      // First verify the OTP
      await verifyOtp(phone, otp);
      setMessage("OTP verified! Logging in...");
      
      // Then login
      await login(phone, otp);
      setMessage("Login successful!");
      
      // Redirect to home
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP or login");
      setStep("otp");
    }
  };

  const handleResendOtp = () => {
    setStep("phone");
    setOtp("");
    setMessage("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Food Order App</h1>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Enter Your Phone Number</h2>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className={`w-full p-2 rounded text-white font-semibold transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Enter OTP</h2>
            <p className="text-sm text-gray-600">
              We've sent an OTP to <strong>{phone}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleVerifyAndLogin}
              disabled={isLoading}
              className={`w-full p-2 rounded text-white font-semibold transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="w-full p-2 rounded text-blue-500 font-semibold border border-blue-500 hover:bg-blue-50 transition"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
