// src/pages/admin/Profile.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosRequest";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaEdit,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdVerified, MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbSchool } from "react-icons/tb";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ArrowLeft } from "lucide-react";
import Squares from "../../../components/ui/Squares";
import SpotlightCard from "../../../components/ui/SpotlightCard";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin } = useAdminAuth();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/profile");
        setProfile(response.data.data.user);
        setCollege(response.data.data.collegeDetails);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        toast.error(error.response?.data?.message || "Failed to fetch profile");
        if (error.response?.status === 403) {
          navigate("/admin/home");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  if (loading || loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Squares background with animation */}
      <div className="fixed inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.3}
          borderColor="rgba(99, 102, 241, 0.2)"
          squareSize={50}
          hoverFillColor="rgba(99, 102, 241, 0.15)"
        />
      </div>

      <AdminHeader />
      <div className="relative z-10 min-h-screen text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
              <MdOutlineAdminPanelSettings
                className="mr-2 text-blue-400"
                size={30}
              />
              Admin Profile
            </h1>
            <Link
              onClick={() => {
                navigate(-1);
              }}
              className="flex items-center text-blue-400 hover:text-blue-200 mb-5"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to Previous Page</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Profile Card */}
            {/* <div className="bg-gray-800/60 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"> */}
            <SpotlightCard
              className="w-full custom-spotlight-card bg-gray-800/60 backdrop-blur-md shadow-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700/80 backdrop-blur-sm flex items-center justify-center border-4 border-blue-500 shadow-lg">
                      <FaUser className="text-blue-400" size={50} />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mt-4">
                    {profile?.name || "Admin User"}
                  </h2>
                  <span className="bg-blue-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm mt-2">
                    {profile?.role}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-400 mr-3" />
                    <span>{profile?.email}</span>
                  </div>

                  {profile?.phoneNumber && (
                    <div className="flex items-center">
                      <FaPhone className="text-blue-400 mr-3" />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}

                  {profile?.lastLogin && (
                    <div className="flex items-center">
                      <span className="text-gray-300 text-sm">
                        Last Login:{" "}
                        {new Date(profile.lastLogin).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to="/admin/update-profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center w-full transition-all duration-300 transform hover:scale-105"
                  >
                    <FaEdit className="mr-2" />
                    Update Profile
                  </Link>
                </div>
              </div>
              {/* </div> */}
            </SpotlightCard>

            {/* College Information Card */}
            {college ? (
              // <div className="bg-gray-800/60 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
              <SpotlightCard
                className="w-full custom-spotlight-card bg-gray-800/60 backdrop-blur-md shadow-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <TbSchool className="mr-2 text-blue-400" size={24} />
                      College Information
                    </h2>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                          college.status === "verified"
                            ? "bg-green-500/80"
                            : "bg-yellow-500/80"
                        }`}
                      >
                        {college.status}
                        {college.status === "verified" && (
                          <MdVerified className="ml-1 inline" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-6">
                    {college.logo ? (
                      <img
                        src={college.logo}
                        alt={college.name}
                        className="h-24 object-contain bg-white/10 backdrop-blur-sm p-2 rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-700/80 backdrop-blur-sm flex items-center justify-center">
                        <FaBuilding className="text-blue-400" size={40} />
                      </div>
                    )}
                    <h3 className="text-xl font-bold mt-3">{college.name}</h3>
                    <span className="text-gray-300 text-sm">
                      Code: {college.code}
                    </span>
                    <span className="text-gray-300 text-sm">
                      Domain: {college.domain}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {college.address && (
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-blue-400 mr-3 mt-1" />
                        <span>
                          {college.address.street}, {college.address.city},{" "}
                          {college.address.state}, {college.address.pincode},{" "}
                          {college.address.country}
                        </span>
                      </div>
                    )}

                    {college.contactEmail && (
                      <div className="flex items-center">
                        <FaEnvelope className="text-blue-400 mr-3" />
                        <span>{college.contactEmail}</span>
                      </div>
                    )}

                    {college.contactPhone && (
                      <div className="flex items-center">
                        <FaPhone className="text-blue-400 mr-3" />
                        <span>{college.contactPhone}</span>
                      </div>
                    )}

                    {college.website && (
                      <div className="flex items-center">
                        <FaGlobe className="text-blue-400 mr-3" />
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {college.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {profile?.role === "admin" && (
                    <div className="mt-6">
                      <Link
                        to="/admin/update-college"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center w-full transition-all duration-300 transform hover:scale-105"
                      >
                        <FaEdit className="mr-2" />
                        Update College
                      </Link>
                    </div>
                  )}
                </div>
                {/* </div> */}
              </SpotlightCard>
            ) : (
              <SpotlightCard
                className="w-full custom-spotlight-card bg-gray-800/60 backdrop-blur-md shadow-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <TbSchool className="mr-2 text-blue-400" size={24} />
                  College Information
                </h2>
                <p className="text-gray-300">
                  No college information associated with this account.
                </p>
              </SpotlightCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
