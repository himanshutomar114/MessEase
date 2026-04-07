import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";
import Squares from "../../components/ui/Squares";
import { FaBuilding } from "react-icons/fa";
import SpotlightCard from "../../components/ui/SpotlightCard";

const AdminHome = () => {
  const [college, setCollege] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [collegeExists, setCollegeExists] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const { loadingAdmin, isAdmin } = useAdminAuth();

  useEffect(() => {
    const fetchCollegeAndHostels = async () => {
      try {
        // Fetch college details
        const collegeResponse = await api.post(`/api/admin/college`);

        if (collegeResponse.status === 200) {
          setCollege(collegeResponse.data.college);
          setCollegeExists(true);

          // If college exists, fetch its hostels
          try {
            const hostelsResponse = await api.post(
              `/api/hostel/fetchAllHostels`
            );
            setHostels(hostelsResponse.data.hostels || []);

            // Fetch messes
            const messesResponse = await api.post(`/api/mess/fetchAllMesses`);
            setMesses(messesResponse.data.data || []);
          } catch (error) {
            console.error("Error fetching hostels or messes:", error);
            toast.error("Error fetching data");
          }
        } else if (collegeResponse.status === 207) {
          setRequestPending(true);
        }
      } catch (error) {
        console.error("Error fetching college:", error);
        toast.error("Error fetching college details");
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeAndHostels();
  }, []);

  const handleHostelClick = (hostelCode) => {
    navigate(`/admin/hostel/${hostelCode}`);
  };

  const handleMessClick = (messCode) => {
    navigate(`/admin/mess/${messCode}`);
  };

  const handleSeeStudents = () => {
    navigate("/admin/students");
  };

  if (loading || loadingAdmin) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Squares background */}
      <div className="fixed inset-0 z-0">
        <Squares
          speed={0.3}
          squareSize={50}
          direction="diagonal"
          borderColor="#374151"
          hoverFillColor="#4B5563"
        />
      </div>

      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {collegeExists ? (
          <div className="p-8 max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="relative mb-8">
              {/* Background overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                <h1 className="text-4xl font-bold mb-4 md:mb-0 text-indigo-300">
                  Admin Dashboard
                </h1>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSeeStudents}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center transition-all shadow-lg hover:shadow-purple-500/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    See Students
                  </button>
                </div>
              </div>
            </div>

            {/* College Info Card */}
            {/* <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-xl p-6 mb-10 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300"> */}
            <SpotlightCard
              className="w-full custom-spotlight-card bg-gray-800/60 backdrop-blur-lg shadow-lg p-6 mb-10 overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="flex items-center mb-6">
                {college.logo ? (
                  <img
                    src={college.logo}
                    alt={`${college.name} logo`}
                    className="w-24 h-24 object-contain rounded-lg mr-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center mr-4">
                    <FaBuilding className="text-gray-400" size={40} />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-indigo-300">
                  {college.name}
                </h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                    College Details
                  </h2>
                  <div className="space-y-3 text-gray-300">
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Domain:</span>{" "}
                      <span className="ml-2">{college.domain}</span>
                    </p>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={college.website}
                        className="ml-2 text-indigo-400 hover:text-indigo-300 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {college.website}
                      </a>
                    </p>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-medium">Contact Email:</span>{" "}
                      <span className="ml-2">{college.contactEmail}</span>
                    </p>
                    <p className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="font-medium">Contact Phone:</span>{" "}
                      <span className="ml-2">{college.contactPhone}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                    Address
                  </h2>
                  <div className="text-gray-300 p-4 bg-gray-700 bg-opacity-40 rounded-lg">
                    <p className="flex items-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-3 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{college.address.street}</span>
                    </p>
                    <p className="ml-9 mb-1">
                      {college.address.city}, {college.address.state}
                    </p>
                    <p className="ml-9">
                      {college.address.pincode}, {college.address.country}
                    </p>
                  </div>
                </div>
              </div>
              {/* </div> */}
            </SpotlightCard>

            {/* Hostels & Students Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Hostels Summary Card */}
              <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Hostels
                  </h2>
                  <span className="bg-white rounded-full px-3 py-1 text-indigo-700 font-bold">
                    {hostels.length}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    Manage your campus hostels and their facilities
                  </p>
                  <Link to="/admin/create-hostel">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg hover:shadow-indigo-500/20 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Hostel
                    </button>
                  </Link>
                </div>
              </div>

              {/* Students Summary Card */}
              <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Students
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    Manage student registrations, assignments, and records
                  </p>
                  <button
                    onClick={handleSeeStudents}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg hover:shadow-purple-500/20 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View Students
                  </button>
                </div>
              </div>
            </div>

            {/* Hostels Section */}
            <div className="mb-10">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 rounded-lg"></div>
                <div className="relative flex justify-between items-center mb-6 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Hostels Directory
                  </h2>
                  <Link to="/admin/create-hostel">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg hover:shadow-green-500/20 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Hostel
                    </button>
                  </Link>
                </div>
              </div>

              {/* Hostels Grid */}
              {hostels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostels.map((hostel) => (
                    <div
                      key={hostel._id}
                      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700 hover:border-indigo-500/50 overflow-hidden"
                      onClick={() => handleHostelClick(hostel.code)}
                    >
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-100">
                            {hostel.name}
                          </h3>
                          <span className="bg-indigo-900 text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {hostel.code}
                          </span>
                        </div>
                        <p className="text-gray-400 flex items-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-indigo-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {hostel.location}
                        </p>
                        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHostelClick(hostel.code);
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            Manage Hostel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-gray-700">
                  <div className="flex justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">
                    No hostels found for this college.
                  </p>
                  <Link to="/admin/create-hostel">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all">
                      Create Your First Hostel
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Messes Section (Similar structure as Hostels) */}
            <div className="mb-10">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 rounded-lg"></div>
                <div className="relative flex justify-between items-center mb-6 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Messes Directory
                  </h2>
                  <Link to="/admin/mess/create">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg hover:shadow-green-500/20 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Mess
                    </button>
                  </Link>
                </div>
              </div>

              {/* Messes Grid */}
              {messes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messes.map((mess) => (
                    <div
                      key={mess._id}
                      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700 hover:border-orange-500/50 overflow-hidden"
                      onClick={() => handleMessClick(mess.code)}
                    >
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-100">
                            {mess.name}
                          </h3>
                          <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {mess.code}
                          </span>
                        </div>
                        <p className="text-gray-400 flex items-center mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-orange-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          {mess.location || "Location not specified"}
                        </p>
                        <div className="flex justify-between items-center mt-3 mb-4">
                          <span className="text-sm text-gray-500 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            Capacity: {mess.capacity}
                          </span>
                        </div>
                        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessClick(mess.code);
                            }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            Manage Mess
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  {/* Background overlay for the card */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl"></div>
                  <div className="relative z-10 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-gray-700">
                    <div className="flex justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-4">
                      No messes found for this college.
                    </p>
                    <Link to="/admin/mess/create">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all">
                        Create Your First Mess
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative min-h-screen flex items-center justify-center">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800"></div>
            <div className="relative z-10">
              {requestPending ? (
                <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg border border-amber-500/30 max-w-md">
                  <div className="flex justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="mb-6 text-amber-400 text-xl font-semibold">
                    Your college registration request is pending approval
                  </div>
                  <p className="text-gray-400 mb-6">
                    Please wait while administrators review your request. You'll
                    be notified once your college is approved.
                  </p>
                  <button className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 cursor-not-allowed opacity-80">
                    Request Pending
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg border border-green-500/30 max-w-md">
                  <div className="flex justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="mb-4 text-xl font-semibold text-white">
                    Welcome to the Admin Portal
                  </div>
                  <p className="text-gray-400 mb-6">
                    You need to create a college before adding hostels, messes,
                    or students.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/admin/college/create">
                      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 shadow-lg hover:shadow-green-500/20 transition-all w-full sm:w-auto">
                        Create College
                      </button>
                    </Link>
                    <Link to="/admin/college/join">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20 transition-all w-full sm:w-auto">
                        Join College
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
