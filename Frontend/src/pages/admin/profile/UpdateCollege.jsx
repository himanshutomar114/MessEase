import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/axiosRequest";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaCity,
  FaFlag,
  FaUpload,
  FaArrowLeft,
} from "react-icons/fa";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import useAdminAuth from "../../../hooks/useAdminAuth";

const UpdateCollege = () => {
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },
  });
  const [logo, setLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isAdminOrNot, setIsAdminOrNot] = useState(false);
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const checkPermissionsAndLoadData = async () => {
      try {
        setInitialLoading(true);

        // First, check if user is an admin
        const profileResponse = await api.get("/api/admin/profile");
        const { user } = profileResponse.data.data;

        if (user.role !== "admin") {
          toast.error("Only admins can update college details");
          navigate("/admin/profile");
          return;
        }

        setIsAdminOrNot(true);

        // Now fetch college details
        const collegeResponse = await api.get("/api/college/getCollege");
        console.log(collegeResponse);
        const college = collegeResponse.data.college;

        setFormData({
          name: college.name || "",
          contactEmail: college.contactEmail || "",
          contactPhone: college.contactPhone || "",
          website: college.website || "",
          address: {
            street: college.address?.street || "",
            city: college.address?.city || "",
            state: college.address?.state || "",
            pincode: college.address?.pincode || "",
            country: college.address?.country || "",
          },
        });

        if (college.logo) {
          setPreviewUrl(college.logo);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Failed to load data");
        navigate("/admin/profile");
      } finally {
        setInitialLoading(false);
      }
    };

    checkPermissionsAndLoadData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdminOrNot) {
      toast.error("Only admins can update college details");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("contactEmail", formData.contactEmail);
      formDataToSend.append("contactPhone", formData.contactPhone);
      formDataToSend.append("website", formData.website);

      // Add address fields
      Object.entries(formData.address).forEach(([key, value]) => {
        formDataToSend.append(`address[${key}]`, value);
      });

      if (logo) {
        formDataToSend.append("logo", logo);
      }

      const response = await api.patch(
        "/api/college/update-college",
        formDataToSend
      );

      toast.success("College details updated successfully");
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating college details:", error);
      toast.error(
        error.response?.data?.message || "Failed to update college details"
      );
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

  if (!isAdminOrNot) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <MdOutlineAdminPanelSettings
              className="text-red-500 mx-auto mb-4"
              size={50}
            />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="mb-4">Only administrators can access this page.</p>
            <button
              onClick={() => navigate("/admin/profile")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Return to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/admin/profile")}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </button>

          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <FaBuilding className="mr-3 text-blue-500" />
            Update College Details
          </h1>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              {/* College Logo */}
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <div className="mb-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="College Logo"
                        className="h-32 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gray-700 flex items-center justify-center mx-auto">
                        <FaBuilding className="text-gray-400" size={50} />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="logo"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer inline-flex items-center"
                  >
                    <FaUpload className="mr-2" />
                    Upload Logo
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* College Name */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">College Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter college name"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGlobe className="text-gray-500" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">College Address</h3>

                {/* Street */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Street</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 mb-2">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCity className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="bg-gray-700 border border-gray-600 rounded-md py-3 px-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                {/* Postal Code and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className="bg-gray-700 border border-gray-600 rounded-md py-3 px-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Country</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFlag className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="bg-gray-700 border border-gray-600 rounded-md py-3 pl-10 pr-3 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md w-full flex items-center justify-center mt-8"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Update College Details"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCollege;
