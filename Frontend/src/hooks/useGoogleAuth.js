// src/hooks/useGoogleAuth.js
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setCode } from "../store/authSlice";
import toast from "react-hot-toast";
import api from "../utils/axiosRequest";

const useGoogleAuth = (userType = "student") => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const endpoint =
        userType === "admin" ? "/api/admin/google" : "/api/student/google";

      const response = await api.post(endpoint, {
        tokenId: credentialResponse.credential,
      });
      console.log("first", response);
      dispatch(setUser(response.data.user));
      if (response.data.user?.code) {
        dispatch(setCode(response.data.user.code));
      }

      if (response.status === 200) {
        // Store tokens
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        // Update Redux state
        // dispatch(setUser(response.data.user));

        toast.success(response.data.message || `Google login successful`);

        // Redirect based on user type
        const redirectPath =
          userType === "admin" ? "/admin/home" : "/student/home";
        navigate(redirectPath);
      }
    } catch (error) {
      console.log("Google sign-in error:", error);
      if (error.response?.status === 210) {
        toast.error(
          "An account with this email already exists. Please log in with password."
        );
      } else if (error.response?.status === 220 && userType === "admin") {
        toast.error("This email domain is not authorized for admin access.");
      } else {
        toast.error(error.response?.data?.message || "Google login failed");
      }
    }
  };

  const handleGoogleFailure = (error) => {
    console.log("Google login failed:", error);
    toast.error("Google login failed. Please try again.");
  };

  return { handleGoogleSuccess, handleGoogleFailure };
};

export default useGoogleAuth;

// // src/hooks/useGoogleAuth.js
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { setUser } from "../store/authSlice";
// import toast from "react-hot-toast";
// import api from "../utils/axiosRequest";

// const useGoogleAuth = (userType = "student") => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       const endpoint =
//         userType === "admin" ? "/api/admin/google" : "/api/student/google";

//       const response = await api.post(endpoint, {
//         tokenId: credentialResponse.credential,
//       });
//       //   console.log("first",response)

//       if (response.status === 200) {
//         // Store tokens
//         localStorage.setItem("accessToken", response.data.accessToken);
//         localStorage.setItem("refreshToken", response.data.refreshToken);
//         // Update Redux state
//         // dispatch(setUser(response.data.user));

//         toast.success(response.data.message || `Google login successful`);

//         // Redirect based on user type
//         const redirectPath =
//           userType === "admin" ? "/admin/home" : "/student/home";
//         navigate(redirectPath);
//       }
//     } catch (error) {
//       console.log("Google sign-in error:",error);
//       if (error.response?.status === 210) {
//         toast.error(
//           "An account with this email already exists. Please log in with password."
//         );
//       } else if (error.response?.status === 220 && userType === "admin") {
//         toast.error("This email domain is not authorized for admin access.");
//       } else {
//         toast.error(error.response?.data?.message || "Google login failed");
//       }
//     }
//   };

//   const handleGoogleFailure = (error) => {
//     console.log("Google login failed:", error);
//     toast.error("Google login failed. Please try again.");
//   };

//   return { handleGoogleSuccess, handleGoogleFailure };
// };

// export default useGoogleAuth;
