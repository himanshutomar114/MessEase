// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../utils/axiosRequest";

const ProtectedRoute = ({ children, userType = "student" }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a user in Redux, consider them authenticated
      if (user) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Check for token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Verify token with backend
      try {
        const endpoint = `/api/${userType}/verify-token`;
        const res = await api.post(endpoint);
        console.log("first", res);
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalid - clear storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [user, userType]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${userType}/home`} />;
  }

  return children;
};

export default ProtectedRoute;
