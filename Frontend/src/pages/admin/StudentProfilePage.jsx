import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import {
  FaBan,
  FaUnlock,
  FaUser,
  FaGraduationCap,
  FaDoorOpen,
  FaCodeBranch,
  FaCalendarAlt,
  FaBuilding,
  FaSchool,
  FaUserTag,
  FaUserLock,
  FaCheckCircle,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAdminAuth from "../../hooks/useAdminAuth";

const StudentProfilePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();
  const navigate = useNavigate();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  // Fetch student details
  const fetchStudent = async () => {
    try {
      const res = await api.get(`/api/admin/students/${id}`);
      setStudent(res.data.data);
    } catch (err) {
      console.error("Error fetching student details:", err);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle block toggle
  const toggleBlock = async () => {
    if (!student) return;
    setToggleLoading(true);
    try {
      const payload = {
        isBlocked: !student.isBlocked,
      };
      const res = await api.put(
        `/api/admin/students/${id}/toggle-block`,
        payload
      );
      setStudent(res.data.data);
      toast.success(
        `Student ${student.isBlocked ? "unblocked" : "blocked"} successfully`
      );
    } catch (err) {
      console.error("Error toggling block status:", err);
      toast.error("Failed to update student status");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading || loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
            <div className="text-xl font-semibold">Loading student data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Link
          to="/admin/students"
          className="inline-flex items-center text-gray-300 hover:text-indigo-400 mb-6 transition duration-200 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Back to Student List</span>
        </Link>

        {/* Student Profile Card */}
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
          {/* Header with student name, photo and status */}
          <div className="bg-gradient-to-r from-indigo-900/60 to-gray-800 p-8 border-b border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-5"></div>
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between relative z-10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-indigo-500/50 shadow-lg shadow-indigo-500/20 mb-4 md:mb-0 md:mr-6">
                  {student.profilePicture && !imageError ? (
                    <img
                      src={student.profilePicture}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <FaUserCircle className="text-gray-900 w-full h-full" />
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {student.name || "N/A"}
                  </h1>
                  <p className="text-indigo-300 text-lg mt-1">
                    {student.rollNumber || "No Roll Number"}
                  </p>
                </div>
              </div>
              <div
                className={`mt-4 md:mt-0 px-6 py-3 rounded-full text-sm font-semibold flex items-center ${
                  student.isBlocked
                    ? "bg-red-900/40 text-red-300 border border-red-700"
                    : "bg-green-900/40 text-green-300 border border-green-700"
                }`}
              >
                {student.isBlocked ? (
                  <>
                    <FaBan className="mr-2" /> Blocked
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" /> Active
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-750/50 rounded-xl p-6 border border-gray-700 hover:border-indigo-500/30 transition duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center pb-3 border-b border-gray-700">
                  <FaUser className="mr-3 text-indigo-400" />
                  Personal Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaUser className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Full Name</p>
                      <p className="text-lg text-white font-medium">
                        {student.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaGraduationCap className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Roll Number</p>
                      <p className="text-lg text-white font-medium">
                        {student.rollNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaUserTag className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Role</p>
                      <p className="text-lg text-white font-medium">
                        {student.role || "Student"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-750/50 rounded-xl p-6 border border-gray-700 hover:border-indigo-500/30 transition duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center pb-3 border-b border-gray-700">
                  <FaGraduationCap className="mr-3 text-indigo-400" />
                  Academic Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaCodeBranch className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Branch</p>
                      <p className="text-lg text-white font-medium">
                        {student.branch || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaCalendarAlt className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Year</p>
                      <p className="text-lg text-white font-medium">
                        {student.year || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaSchool className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">College</p>
                      <p className="text-lg text-white font-medium">
                        {student.college && student.college.name
                          ? student.college.name
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accommodation Information */}
              <div className="bg-gray-750/50 rounded-xl p-6 border border-gray-700 hover:border-indigo-500/30 transition duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center pb-3 border-b border-gray-700">
                  <FaDoorOpen className="mr-3 text-indigo-400" />
                  Accommodation
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaBuilding className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Hostel</p>
                      <p className="text-lg text-white font-medium">
                        {student.hostel && student.hostel.name
                          ? student.hostel.name
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gray-700 p-2 rounded-lg mr-4">
                      <FaDoorOpen className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Room</p>
                      <p className="text-lg text-white font-medium">
                        {student.room || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Controls */}
              <div className="bg-gray-750/50 rounded-xl p-6 border border-gray-700 hover:border-indigo-500/30 transition duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center pb-3 border-b border-gray-700">
                  <FaUserLock className="mr-3 text-indigo-400" />
                  Status & Controls
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div
                      className={`bg-gray-700 p-2 rounded-lg mr-4 ${
                        student.isBlocked ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {student.isBlocked ? <FaBan /> : <FaUnlock />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Account Status
                      </p>
                      <p
                        className={`text-lg font-medium ${
                          student.isBlocked ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {student.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleBlock}
                    disabled={toggleLoading}
                    className={`mt-6 w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      student.isBlocked
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-green-700/30"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-red-700/30"
                    } text-white font-medium`}
                  >
                    {toggleLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {student.isBlocked ? (
                          <>
                            <FaUnlock className="mr-2" /> Unblock Student
                          </>
                        ) : (
                          <>
                            <FaBan className="mr-2" /> Block Student
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
