// src/hooks/useAdminAuth.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/axiosRequest";

const useAdminAuth = () => {
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const data = await api.post("/api/admin/verify-token");
        if (
          data.data?.verified === undefined ||
          data.data?.verified === false
        ) {
          setIsVerified(false);
        }
        if (
          !(
            data.data.userInfo.role === "admin" ||
            data.data.userInfo.role === "messManager" ||
            data.data.userInfo.role === "hostelManager"
          )
        ) {
          toast.error("You are not authorized to access this page.");
          navigate("/student/home");
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
        setLoadingAdmin(false);
      } catch (err) {
        console.log(err);
        toast.error("Login to continue");
        setLoadingAdmin(false);
        navigate("/admin/login");
      }
    };

    verifyAdmin();
  }, [navigate]);

  return { loadingAdmin, isAdmin, isVerified };
};

export default useAdminAuth;
