import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import AuthForm from "../../components/auth/AuthForm";
import Squares from "../../components/ui/Squares";
import SpotlightCard from "../../components/ui/SpotlightCard";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const ForgotPassword = ({ userType = "student" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: Email entry, 2: Password reset with OTP
  const [email, setEmail] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // Check if the user is authenticated first
      if (!isAuthenticated) {
        dispatch(logout());
        setLoading(false);
        return;
      }

      try {
        const res = await api.post(`/api/${userType}/verify-token`);
        console.log(res);
        navigate(`/${userType}/home`);
      } catch (error) {
        console.log(error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [isAuthenticated, navigate, dispatch]);

  // Form field configurations
  const emailFields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      validation: {
        required: "Email is required",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
  ];

  const resetFields = [
    {
      id: "otp",
      label: "OTP",
      type: "text",
      validation: {
        required: "OTP is required",
        minLength: {
          value: 6,
          message: "OTP must be 6 digits",
        },
      },
    },
    {
      id: "password",
      label: "New Password",
      type: "password",
      validation: {
        required: "Password is required",
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
      },
    },
    {
      id: "confirmPassword",
      label: "Confirm New Password",
      type: "password",
      validation: {
        required: "Please confirm your password",
        validate: (value) =>
          value === document.getElementById("password")?.value ||
          "Passwords do not match",
      },
    },
  ];

  // Handle email submission
  const handleEmailSubmit = async (data) => {
    try {
      setEmail(data.email);
      const endpoint =
        userType === "admin"
          ? "/api/admin/forgot-password"
          : "/api/student/forgot-password";

      await api.post(endpoint, { email: data.email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Handle password reset with OTP verification
  const handleResetSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const endpoint =
        userType === "admin"
          ? "/api/admin/change-password"
          : "/api/student/change-password";

      await api.post(endpoint, {
        email: email,
        otp: data.otp,
        password: data.password,
      });

      toast.success("Password changed successfully");
      navigate(`/${userType}/login`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  // Base styles for both user types
  const basePageStyle =
    "min-h-screen flex items-center justify-center p-4 relative";

  // Additional gradient only for admin users
  const pageStyle =
    userType === "admin"
      ? `${basePageStyle} bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900`
      : basePageStyle;

  const spotlightColor =
    userType === "admin"
      ? "rgba(59, 130, 246, 0.3)" // More blue for admin
      : "rgba(125, 211, 252, 0.2)"; // Lighter blue for student

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStyle}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Squares
          speed={0.2}
          squareSize={40}
          direction="diagonal"
          borderColor="#374151" // gray-700
          hoverFillColor="#4B5563" // gray-600
        />
      </div>

      <SpotlightCard
        className="w-full max-w-sm"
        spotlightColor={spotlightColor}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
          {userType === "admin" ? "Admin" : "Student"} Password Reset
        </h2>

        {step === 1 && (
          <AuthForm
            fields={emailFields}
            onSubmit={handleEmailSubmit}
            submitText="Send OTP"
            title=""
            darkMode={true}
            containerless={true}
          />
        )}

        {step === 2 && (
          <>
            <p className="text-gray-300 mb-4 text-sm">
              We've sent a 6-digit OTP to {email}
            </p>
            <AuthForm
              fields={resetFields}
              onSubmit={handleResetSubmit}
              submitText="Reset Password"
              title=""
              darkMode={true}
              containerless={true}
            />
            <button
              onClick={() => handleEmailSubmit({ email })}
              className="mt-2 w-full text-sm text-blue-400 hover:text-blue-300"
            >
              Resend OTP
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to={`/${userType}/login`}
            className="text-sm text-gray-400 hover:text-blue-400"
          >
            Back to Login
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default ForgotPassword;
