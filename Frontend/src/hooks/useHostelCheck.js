import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/axiosRequest";
import { useDispatch, useSelector } from "react-redux";
import { setIsBlocked } from "../store/authSlice";

const useHostelCheck = () => {
  const [loadingCheck, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Move this to the top level of the hook
  const { code } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifyHostel = async () => {
      try {
        const response = await api.get("/api/student/check-hostel-assignment");
        const { user } = response.data.data;

        // Now use the dispatch from the outer scope
        dispatch(setIsBlocked(user.isBlocked));

        if (
          !(
            user.role === "student" ||
            user.role === "messManager" ||
            user.role === "hostelManager"
          )
        ) {
          toast.error("You are not authorized to access this page.");
          setLoading(false);
          navigate("/admin/home");
        }
        if (user.role === "student" && !user.hostel) {
          setLoading(false);
          toast.error("Hostel must be assigned.");
          navigate("/student/update-profile");
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log("Error checking hostel assignment:", err);
        navigate("/student/login");
      }
    };
    verifyHostel();
  }, [navigate, dispatch]);

  return { loadingCheck };
};

export default useHostelCheck;
