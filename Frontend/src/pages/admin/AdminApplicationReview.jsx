import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ApplicationDetailModal from "../../components/admin/ApplicationDetailModal";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";

const AdminApplicationReview = () => {
  const [election, setElection] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  // State for modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get election details and applications
        const [electionRes, applicationsRes] = await Promise.all([
          api.get(`/api/election/${electionId}`),
          api.get(`/api/election/admin/${electionId}/applications`),
        ]);
        console.log(electionRes);
        setElection(electionRes.data.data);
        setApplications(applicationsRes.data.data);

        // Pre-select approved applications
        const approvedApplications = applicationsRes.data.data
          .filter((app) => app.status === "approved")
          .map((app) => app._id);

        setSelectedApplications(approvedApplications);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId]);

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app._id));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const res = await api.patch(
        `/api/election/admin/${electionId}/select-candidates`,
        {
          applicationIds: selectedApplications,
        }
      );
      //   console.log(res)
      if (res?.data?.phase) {
        toast.success(`${res.data.message}`);
      } else toast.success("Candidates selected successfully");
      navigate(`/admin/election`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to select candidates"
      );
      setSubmitting(false);
    }
  };

  // Function to open modal with application details
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  if (loading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header with improved styling */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-300">
            Review Applications:{" "}
            <span className="text-white">
              {election.type === "messManager"
                ? "Mess Manager"
                : "Hostel Manager"}
            </span>
          </h1>
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Elections
          </button>
        </div>

        {/* Election Info Card - Improved with status indicators */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="font-semibold text-xl mb-4 text-blue-300">
                {election.type === "messManager" ? "Mess" : "Hostel"}:{" "}
                <span className="text-white">{election?.name || "N/A"}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-gray-300">Applications:</span>
                  <span className="font-medium">{applications.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-gray-300">College:</span>
                  <span className="font-medium">{election?.collegeName}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-gray-700">
                <span className="text-gray-300">Application Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    election.applicationPhase.isOpen
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {election.applicationPhase.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-gray-700">
                <span className="text-gray-300">Voting Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    election.votingPhase.isOpen
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {election.votingPhase.isOpen ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table Card - Enhanced design */}
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mb-8 border border-gray-700">
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg text-blue-300 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Applications
                <span className="ml-2 px-2 py-0.5 text-sm bg-blue-900 text-blue-300 rounded-full">
                  {applications.length}
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500 rounded"
                    checked={
                      selectedApplications.length === applications.length &&
                      applications.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <span className="ml-2 text-sm text-gray-300">Select All</span>
                </label>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>No applications found for this election.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Select
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Roll Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Submitted On
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500 rounded"
                          checked={selectedApplications.includes(
                            application._id
                          )}
                          onChange={() =>
                            handleSelectApplication(application._id)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {application.user?.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-600"
                                src={application.user.profileImage}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-gray-200 font-medium text-lg">
                                {application.user?.name?.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">
                              {application.user?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {application.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-200">
                          {application.user?.rollNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === "approved"
                              ? "bg-green-900 text-green-300"
                              : application.status === "rejected"
                                ? "bg-red-900 text-red-300"
                                : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => navigate("/admin/election")}
            className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 ${
              submitting
                ? "bg-blue-500 cursor-not-allowed opacity-75"
                : "bg-blue-600 hover:bg-blue-700 transition-colors"
            }`}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Selected Candidates
              </>
            )}
          </button>
        </div>

        {/* Application Detail Modal */}
        {showModal && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminApplicationReview;
