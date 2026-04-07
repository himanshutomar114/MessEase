// src/pages/admin/UpdateAdminProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/axiosRequest";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import useAdminAuth from "../../../hooks/useAdminAuth";

const UpdateAdminProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin } = useAdminAuth();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get("/api/admin/profile");
        const { user } = response.data.data;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });

        if (user.profilePicture) {
          setPreviewUrl(user.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        toast.error(error.response?.data?.message || "Failed to fetch profile");
        if (error.response?.status === 403) {
          navigate("/admin/home");
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);

      if (profilePicture) {
        formDataToSend.append("profilePicture", profilePicture);
      }

      const response = await api.patch(
        "/api/admin/update-profile",
        formDataToSend
      );

      toast.success("Profile updated successfully");
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating admin profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || loadingAdmin) {
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
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/admin/profile")}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </button>

          <h1 className="text-3xl font-bold mb-8">Update Admin Profile</h1>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-blue-500">
                      <FaUser className="text-gray-400" size={50} />
                    </div>
                  )}
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition"
                  >
                    <FaCamera size={18} />
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="bg-gray-800 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-8">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdminProfile;
