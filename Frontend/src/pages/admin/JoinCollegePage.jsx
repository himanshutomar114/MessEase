import React, { useState } from "react";
import api from "../../utils/axiosRequest";
import useAdminAuth from "../../hooks/useAdminAuth";
import AdminHeader from "../../components/AdminHeader";

const JoinCollegePage = () => {
  // State to store college details
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const { loadingAdmin, isAdmin } = useAdminAuth();

  const handleCodeChange = (e) => {
    setCollegeCode(e.target.value);
    if (collegeDetails) {
      setCollegeDetails(null);
      setShowRoleOptions(false);
      setSelectedRole("");
      setApplicationStatus("");
    }
    if (error) {
      setError("");
    }
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(e.target.value));
  };

  // Function to fetch college details using the axios instance
  const searchCollege = async () => {
    if (!collegeCode.trim()) {
      setError("Please enter a college code");
      return;
    }

    setLoading(true);
    setError("");
    setApplicationStatus("");

    try {
      const response = await api.get(
        `/api/college/verification/${collegeCode}`
      );
      const data = response.data;

      if (data) {
        setCollegeDetails(data);
        if (data.status === "verified") {
          setShowRoleOptions(true);
        }
      } else {
        setError("No college found with that code");
      }
    } catch (err) {
      console.error("Error fetching college data:", err);

      if (err.response) {
        if (err.response.status === 404) {
          setError("College not found. Please check the code and try again.");
        } else {
          setError(
            `Server error: ${err.response.data.message || "Unknown error"}`
          );
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An error occurred while searching for the college.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle role selection and application
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // Function to submit application for selected role with email notification
  const submitRoleApplication = async () => {
    if (!collegeDetails || !selectedRole) return;

    if (!userEmail.trim() || !emailValid) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setApplicationStatus("");
    setError("");

    try {
      await api.post("/api/college/apply-role", {
        role: selectedRole,
        email: userEmail,
        collegeName: collegeDetails.name,
        applicationDetails: {
          position: roles.find((r) => r.id === selectedRole)?.label,
          collegeCode: collegeCode,
          appliedAt: new Date().toISOString(),
        },
      });

      setApplicationStatus("success");
      setShowRoleOptions(false);
    } catch (err) {
      console.error("Error applying for role:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(`Application failed: ${err.response.data.message}`);
      } else {
        setError("Failed to submit application. Please try again.");
      }

      setApplicationStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // Available roles
  const roles = [
    { id: "chiefWarden", label: "Chief Warden", icon: "🍽️" },
    { id: "admin", label: "Admin", icon: "🔑" },
    { id: "accountant", label: "Accountant", icon: "💼" },
  ];

  if (loadingAdmin) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <AdminHeader />
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <AdminHeader />
      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-indigo-900 bg-opacity-30 p-6 rounded-xl shadow-lg border border-indigo-700 mb-8">
          <h1 className="text-3xl font-bold text-white">Join College</h1>
          <p className="text-indigo-200 mt-2">
            Search for your college and apply for a position
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300 mb-6">
          <div className="flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-indigo-400 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-xl font-semibold text-indigo-400">
              Search College
            </h2>
          </div>

          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <input
              type="text"
              placeholder="Enter College Code"
              className="flex-grow border border-gray-600 p-4 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={collegeCode}
              onChange={handleCodeChange}
              onKeyDown={(e) => e.key === "Enter" && searchCollege()}
            />
            <button
              onClick={searchCollege}
              className="bg-indigo-600 text-white px-6 py-4 rounded hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  Search
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-lg border border-red-700">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* College Details Card */}
        {collegeDetails && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300 mb-6">
            <div className="flex items-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-400 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <h2 className="text-xl font-semibold text-indigo-400">
                College Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-1">
                  College Name
                </h3>
                <p className="border border-gray-600 p-3 rounded bg-gray-700">
                  {collegeDetails.name}
                </p>
              </div>

              {collegeDetails.status && (
                <div>
                  <h3 className="text-gray-300 text-sm font-medium mb-1">
                    Status
                  </h3>
                  <p
                    className={`border p-3 rounded flex items-center ${
                      collegeDetails.status === "verified"
                        ? "bg-green-900 bg-opacity-50 text-green-300 border-green-700"
                        : "bg-yellow-900 bg-opacity-50 text-yellow-300 border-yellow-700"
                    }`}
                  >
                    {collegeDetails.status === "verified" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {collegeDetails.status.charAt(0).toUpperCase() +
                      collegeDetails.status.slice(1)}
                  </p>
                </div>
              )}

              {collegeDetails.website && (
                <div>
                  <h3 className="text-gray-300 text-sm font-medium mb-1">
                    Website
                  </h3>
                  <p className="border border-gray-600 p-3 rounded bg-gray-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {collegeDetails.website}
                  </p>
                </div>
              )}

              {collegeDetails.address && (
                <div>
                  <h3 className="text-gray-300 text-sm font-medium mb-1">
                    Location
                  </h3>
                  <p className="border border-gray-600 p-3 rounded bg-gray-700 flex items-center">
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
                    {`${collegeDetails.address.city}, ${collegeDetails.address.state}`}
                  </p>
                </div>
              )}
            </div>

            {collegeDetails.status !== "verified" && (
              <div className="p-4 bg-yellow-900 bg-opacity-30 text-yellow-300 rounded-lg border border-yellow-700 mb-4">
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  This college is pending verification and cannot be joined yet.
                </p>
              </div>
            )}

            {/* Role Selection Section */}
            {showRoleOptions && (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-indigo-400">
                    Select Position
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedRole === role.id
                          ? "border-indigo-500 bg-indigo-900 bg-opacity-30"
                          : "border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                            selectedRole === role.id
                              ? "border-2 border-indigo-400 bg-indigo-500"
                              : "border-2 border-gray-400"
                          }`}
                        >
                          {selectedRole === role.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{role.icon}</span>
                          <span className="font-medium">{role.label}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-gray-300 text-sm font-medium mb-1 block">
                    Your Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 absolute ml-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 w-full border p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        !emailValid && userEmail
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      value={userEmail}
                      onChange={handleEmailChange}
                    />
                  </div>
                  {!emailValid && userEmail && (
                    <p className="text-red-400 text-sm mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    You will receive confirmation and updates about your
                    application at this email.
                  </p>
                </div>

                <button
                  onClick={submitRoleApplication}
                  disabled={
                    !selectedRole || loading || !userEmail || !emailValid
                  }
                  className={`w-full py-4 mt-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                    !selectedRole || loading || !userEmail || !emailValid
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Apply for{" "}
                      {selectedRole
                        ? roles.find((r) => r.id === selectedRole)?.label
                        : "Selected Position"}
                    </span>
                  )}
                </button>

                <p className="text-sm text-gray-400 mt-3 text-center">
                  Your application will be sent to the college administrator for
                  review.
                </p>
              </div>
            )}

            {/* Application Status Messages */}
            {applicationStatus === "success" && (
              <div className="mt-6 p-4 bg-green-900 bg-opacity-30 text-green-300 rounded-lg border border-green-700">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-bold">
                    Application Submitted Successfully!
                  </p>
                </div>
                <p className="ml-8 mb-2">
                  Your application for the position of{" "}
                  {roles.find((r) => r.id === selectedRole)?.label} has been
                  sent to the college administrator.
                </p>
                <p className="ml-8 font-semibold">
                  A confirmation email has been sent to {userEmail}.
                </p>
                <p className="ml-8 text-sm mt-1">
                  You will receive updates about your application status via
                  email.
                </p>
              </div>
            )}

            {applicationStatus === "failed" && (
              <div className="mt-6 p-4 bg-red-900 bg-opacity-30 text-red-300 rounded-lg border border-red-700">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-bold">Application Failed</p>
                </div>
                <p className="ml-8">
                  There was an error submitting your application. Please try
                  again later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCollegePage;
