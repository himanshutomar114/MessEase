import React, { useState } from "react";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const OTPVerification = ({
  email,
  name,
  password,
  phoneNumber,
  userType,
  redirectPath,
  darkMode = false,
}) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Styling classes based on darkMode
  const containerClass = darkMode
    ? "bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700"
    : "bg-white p-8 rounded-lg shadow-lg w-full max-w-md";

  const titleClass = darkMode
    ? "text-2xl font-bold mb-4 text-center text-blue-400"
    : "text-2xl font-bold mb-4 text-center text-gray-800";

  const textClass = darkMode ? "text-gray-300" : "text-gray-600";

  const inputClass = darkMode
    ? "w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
    : "w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg";

  const buttonClass = darkMode
    ? "w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 transition duration-200"
    : "w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200";

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/api/${userType}/verify-otp`;
      const payload = { email, otp, name, password };

      if (userType === "admin" && phoneNumber) {
        payload.phoneNumber = phoneNumber;
      }

      const response = await api.post(endpoint, payload);

      if (userType === "admin") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        dispatch(setUser(response.data));
      }

      toast.success(
        `${userType === "admin" ? "Admin" : "Student"} registration successful!`
      );
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className={containerClass}>
      <h2 className={titleClass}>
        {userType === "admin" ? "Admin" : "Student"} OTP Verification
      </h2>
      <p className={`${textClass} mb-6 text-center`}>
        Please enter the verification code sent to {email}
      </p>
      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div>
          <label className={`${textClass} block font-medium mb-2`}>
            Enter OTP
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <button type="submit" className={buttonClass}>
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;
