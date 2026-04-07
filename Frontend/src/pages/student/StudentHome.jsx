import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Squares from "../../components/ui/Squares";

function StudentHome() {
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const { user, code } = useSelector((state) => state.auth);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyHostel = async () => {
      try {
        const response = await api.get("/api/student/check-hostel-assignment");
        const data = response.data;
        setStudentName(data.data.user.name);
        setUserId(data.data.user._id);
        setIsBlocked(data.data.user.isBlocked);
        if (
          !(
            data.data.user.role === "student" ||
            data.data.user.role === "messManager" ||
            data.data.user.role === "hostelManager"
          )
        ) {
          toast.error("You are not authorized to access this page.");
          navigate("/admin/home");
        }
        if (data.data.user.role === "student" && !data.data.user.hostel) {
          toast.error("Hostel must be assigned.");
          navigate("/student/update-profile");
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate("/student/login");
      }
    };
    verifyHostel();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-100">
      {/* Squares background positioned absolutely to fill the entire page */}
      <div className="fixed inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.3}
          borderColor="rgba(99, 102, 241, 0.2)"
          squareSize={50}
          hoverFillColor="rgba(99, 102, 241, 0.15)"
        />
      </div>

      {/* Content container with dark gradient overlay for better readability */}
      {/* <div className="relative z-10 bg-gradient-to-b from-gray-900/90 to-gray-800/90 min-h-screen flex flex-col"> */}
      <div className="relative z-10 bg-neutral min-h-screen flex flex-col">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex-grow">
          {/* Welcome Section */}
          <div
            className={`p-6 rounded-xl shadow-lg border backdrop-blue-md mb-8 ${
              isBlocked
                ? "bg-red-900/40 border-red-700"
                : "bg-indigo-900/40 border-indigo-700"
            }`}
          >
            <h1 className="text-3xl font-bold text-white">
              {isBlocked
                ? "Account Blocked"
                : `Welcome${studentName ? `, ${studentName}` : ""}`}
            </h1>
            <p
              className={`mt-2 ${isBlocked ? "text-red-200" : "text-indigo-200"}`}
            >
              {isBlocked
                ? "Your account has been temporarily suspended. Please contact administration for assistance."
                : "Access your student resources and manage your campus experience"}
            </p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Room Management Card */}
            <div
              className={`backdrop-blue-md bg-gray-800/70 p-6 rounded-xl shadow-lg border ${
                isBlocked
                  ? "border-gray-700 opacity-70"
                  : "border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-xl"
              }`}
            >
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 mr-3 ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <h2
                  className={`text-xl font-semibold ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                >
                  Room Management
                </h2>
              </div>
              <p
                className={
                  isBlocked ? "text-gray-500 mb-6" : "text-gray-300 mb-6"
                }
              >
                View available rooms and manage your bookings
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => !isBlocked && navigate("/available-rooms")}
                  disabled={isBlocked}
                  className={`px-4 py-3 rounded-lg w-full flex items-center justify-between group ${
                    isBlocked
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300"
                  }`}
                >
                  <span>Available Rooms</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isBlocked ? "" : "group-hover:translate-x-1 transition-transform duration-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => !isBlocked && navigate("/see-booking")}
                  disabled={isBlocked}
                  className={`px-4 py-3 rounded-lg w-full flex items-center justify-between group ${
                    isBlocked
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300"
                  }`}
                >
                  <span>Your Bookings</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isBlocked ? "" : "group-hover:translate-x-1 transition-transform duration-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Elections Card */}
            <div
              className={`backdrop-blue-md bg-gray-800/70 p-6 rounded-xl shadow-lg border ${
                isBlocked
                  ? "border-gray-700 opacity-70"
                  : "border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-xl"
              }`}
            >
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 mr-3 ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <h2
                  className={`text-xl font-semibold ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                >
                  Elections
                </h2>
              </div>
              <p
                className={
                  isBlocked ? "text-gray-500 mb-6" : "text-gray-300 mb-6"
                }
              >
                Participate in campus elections and view results
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => !isBlocked && navigate("/student/election")}
                  disabled={isBlocked}
                  className={`px-4 py-3 rounded-lg w-full flex items-center justify-between group ${
                    isBlocked
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300"
                  }`}
                >
                  <span>View Elections</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isBlocked ? "" : "group-hover:translate-x-1 transition-transform duration-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Fees & Mess Card */}
            <div
              className={`backdrop-blue-md bg-gray-800/70 p-6 rounded-xl shadow-lg border ${
                isBlocked
                  ? "border-gray-700 opacity-70"
                  : "border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-xl"
              }`}
            >
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 mr-3 ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2
                  className={`text-xl font-semibold ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                >
                  Payments & Mess
                </h2>
              </div>
              <p
                className={
                  isBlocked ? "text-gray-500 mb-6" : "text-gray-300 mb-6"
                }
              >
                Manage your fee payments and access mess services
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => !isBlocked && navigate("/student/fees")}
                  disabled={isBlocked}
                  className={`px-4 py-3 rounded-lg w-full flex items-center justify-between group ${
                    isBlocked
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
                  }`}
                >
                  <span>Pay Fees</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isBlocked ? "" : "group-hover:translate-x-1 transition-transform duration-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    !isBlocked && navigate(`/student/mess/${code}`)
                  }
                  disabled={isBlocked}
                  className={`px-4 py-3 rounded-lg w-full flex items-center justify-between group ${
                    isBlocked
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300"
                  }`}
                >
                  <span>Mess Services</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isBlocked ? "" : "group-hover:translate-x-1 transition-transform duration-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div
            className={`backdrop-blue-md bg-gray-800/70 p-6 rounded-xl shadow-lg border ${
              isBlocked
                ? "border-gray-700"
                : "border-gray-700 hover:border-indigo-500 transition-all duration-300"
            }`}
          >
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-7 w-7 mr-3 ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <h2
                className={`text-xl font-semibold ${isBlocked ? "text-gray-400" : "text-indigo-400"}`}
              >
                Quick Links
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
                onClick={() => !isBlocked && navigate("/student/profile")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Profile</span>
              </button>
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span>Notifications</span>
              </button>
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Help Center</span>
              </button>
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span>Academics</span>
              </button>
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
                onClick={() =>
                  !isBlocked && navigate(`/student/mess/${code}/time-table`)
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Calendar</span>
              </button>
              <button
                disabled={isBlocked}
                className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center group ${
                  isBlocked
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 mb-2 ${isBlocked ? "text-gray-500" : "text-indigo-300 group-hover:text-indigo-200"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
