// axiosInstance.js
import axios from "axios";
import { serverUrl } from "./constants";

const api = axios.create({
  baseURL: serverUrl || "http://localhost:4001", // automatically prepends this URL to all requests
  withCredentials: true, // automatically includes credentials (like cookies) with every request
});

// Add response interceptor for token refresh
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;

//       // If error is 401 and we haven't tried to refresh the token yet
//       if (error.response?.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;

//         try {
//           const refreshToken = localStorage.getItem('refreshToken');
//           console.log("REFRESH",refreshToken);
//           if (!refreshToken) {
//             // No refresh token available, redirect to login
//             window.location.href = '/login';
//             return Promise.reject(error);
//           }

//           // Attempt to refresh token
//           const response = await axios.post(
//             `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/refresh-token`, // dont know i think it should be 4001
//             { refreshToken }
//           );

//           // Update tokens in storage
//           localStorage.setItem('accessToken', response.data.accessToken);
//           localStorage.setItem('refreshToken', response.data.refreshToken);

//           // Retry original request with new token
//           originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           // Refresh failed, redirect to login
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           window.location.href = '/login';
//           return Promise.reject(refreshError);
//         }
//       }

//       return Promise.reject(error);
//     }
//   );

export default api;
