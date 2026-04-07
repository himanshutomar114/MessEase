import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setCode } from "../../store/authSlice"; // Adjust path as needed
import api from "../../utils/axiosRequest";
import {
  FaUser,
  FaBuilding,
  FaHome,
  FaDoorOpen,
  FaPhone,
  FaGraduationCap,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";
import Header from "../../components/Header";
import toast from "react-hot-toast";

const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user data from Redux store
  const userData = useSelector((state) => state.auth.user);

  const redirectPath = location.state?.redirect || "/student/home";
  const alertMessage = location.state?.message || "";

  const [user, setUserState] = useState({
    name: "",
    branch: "",
    year: "",
    room: "",
    phoneNumber: "",
    hostel: "",
    profilePicture: "",
    rollNumber: "",
  });

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Populate form with user data from Redux
  useEffect(() => {
    if (userData) {
      setUserState({
        name: userData.name || "",
        branch: userData.branch || "",
        year: userData.year || "",
        room: userData.room || "",
        phoneNumber: userData.phoneNumber || "",
        hostel: userData.hostel || "",
        profilePicture: userData.profilePicture || "",
        rollNumber: userData.rollNumber || "",
      });
    }
  }, [userData]);

  // Fetch user data and hostels
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const userResponse = await api.post("/api/student/verify-token");
        const userInfo = userResponse?.data?.userInfo;

        // Update Redux store with user data
        dispatch(setUser(userInfo));
        dispatch(setCode(userResponse?.data?.code));

        // Update local state with user data
        setUserState({
          name: userInfo?.name || "",
          branch: userInfo?.branch || "",
          year: userInfo?.year || "",
          room: userInfo?.room || "",
          phoneNumber: userInfo?.phoneNumber || "",
          hostel: userInfo?.hostel || "",
          profilePicture: userInfo?.profilePicture || "",
          rollNumber: userInfo?.rollNumber || "",
        });

        // Get hostels for the user's college
        const hostelResponse = await api.post("/api/hostel/fetchAllHostels");
        setHostels(hostelResponse.data.hostels);
        setLoading(false);
      } catch (err) {
        console.log("Error fetching data:", err.response);
        setError(err.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Preview profile picture
  useEffect(() => {
    if (!selectedFile) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  // Validate form fields
  const validateFields = () => {
    const errors = {};

    if (!user.name.trim()) {
      errors.name = "Name is required";
    }

    if (!user.branch) {
      errors.branch = "Branch is required";
    }

    if (!user.year) {
      errors.year = "Year is required";
    }

    if (!user.hostel) {
      errors.hostel = "Hostel is required";
    }

    if (!user.room.trim()) {
      errors.room = "Room number is required";
    } else if (user.room.length > 5) {
      errors.room = "Room number cannot exceed 5 characters";
    }

    if (!user.rollNumber.trim()) {
      errors.rollNumber = "Registration/Roll number is required";
    } else if (user.rollNumber.length > 10) {
      errors.rollNumber = "Registration number cannot exceed 10 characters";
    }

    if (!user.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(user.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    return errors;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special validation for phone numbers - only allow digits
    if (name === "phoneNumber" && value !== "" && !/^\d*$/.test(value)) {
      return;
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    setUserState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length === 1) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all fields
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please fix the errors below");
      return;
    }

    try {
      // First update profile information
      const updateData = {
        name: user.name,
        branch: user.branch,
        year: parseInt(user.year),
        room: user.room,
        phoneNumber: user.phoneNumber,
        hostelId: user.hostel,
        rollNumber: user.rollNumber,
      };

      await api.patch("/api/student/update-profile", updateData);

      // Then upload profile picture if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("profilePicture", selectedFile);

        await api.post("/api/student/upload-profile-picture", formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        });
      }

      // After successful update, fetch the updated user data
      const userResponse = await api.post("/api/student/verify-token");
      const updatedUserInfo = userResponse?.data?.userInfo;

      // Update Redux store with the latest user data
      dispatch(setUser(updatedUserInfo));
      dispatch(setCode(userResponse?.data?.code));

      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully");
      navigate("/student/profile");

      // Redirect after successful update if there was a redirect path
      if (location.state?.redirect) {
        setTimeout(() => navigate(redirectPath), 1500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Update Profile
            </h2>

            {alertMessage && (
              <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 text-yellow-100 px-4 py-3 rounded mb-4">
                <p>{alertMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-100 px-4 py-3 rounded mb-4">
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="mb-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUser size={64} />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <label
                    htmlFor="profile-upload"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition"
                  >
                    <FaUpload className="mr-2" />
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    id="profile-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full mt-2">
                    <div className="bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.name ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white`}
                    placeholder="Your full name"
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div className="mb-4">
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-300"
                >
                  Branch <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <select
                    id="branch"
                    name="branch"
                    value={user.branch}
                    onChange={handleInputChange}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.branch ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white`}
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="BT">Biotechnology</option>
                  </select>
                </div>
                {fieldErrors.branch && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.branch}
                  </p>
                )}
              </div>

              {/* Year */}
              <div className="mb-4">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-300"
                >
                  Year <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <select
                    id="year"
                    name="year"
                    value={user.year}
                    onChange={handleInputChange}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.year ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white`}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                {fieldErrors.year && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.year}
                  </p>
                )}
              </div>

              {/* Hostel - Required Field */}
              <div className="mb-4">
                <label
                  htmlFor="hostel"
                  className="block text-sm font-medium text-gray-300"
                >
                  Hostel <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <select
                    id="hostel"
                    name="hostel"
                    value={user.hostel}
                    onChange={handleInputChange}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.hostel ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white`}
                    required
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.hostel && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.hostel}
                  </p>
                )}
              </div>

              {/* Room Number */}
              <div className="mb-4">
                <label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-300"
                >
                  Room Number <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDoorOpen className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    value={user.room}
                    onChange={handleInputChange}
                    maxLength={5}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.room ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white`}
                    placeholder="e.g. A-101"
                    required
                  />
                </div>
                {fieldErrors.room && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.room}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Maximum 5 characters
                </p>
              </div>

              {/* Roll Number */}
              <div className="mb-4">
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Reg/Roll Number <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="rollNumber"
                    name="rollNumber"
                    value={user.rollNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.rollNumber
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md text-white`}
                    placeholder="Your reg/roll number"
                    required
                  />
                </div>
                {fieldErrors.rollNumber && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.rollNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Maximum 10 characters
                </p>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`bg-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      fieldErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md text-white`}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                {fieldErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.phoneNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Must be exactly 10 digits
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
