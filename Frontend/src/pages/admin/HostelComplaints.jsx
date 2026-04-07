import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest.js";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js"; //import authorization hook
import toast from "react-hot-toast";

const HostelComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();
  const { code } = useParams();

  const { loadingAdmin, isVerified } = useAdminAuth(); //initialize hook

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/complaint/getcomplaints/${code}`);

        // Check if response.data.complaint exists before sorting
        if (
          response.data &&
          response.data.complaint &&
          Array.isArray(response.data.complaint)
        ) {
          // Sort complaints - pending first, then by date (newest first)
          const sortedComplaints = response.data.complaint.sort((a, b) => {
            // Both pending - sort by date
            if (a.status === "Pending" && b.status === "Pending") {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Only a is pending
            if (a.status === "Pending") return -1;
            // Only b is pending
            if (b.status === "Pending") return 1;
            // Neither is pending - sort by date
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setComplaints(sortedComplaints);
        } else {
          // Handle the case where response.data.complaint is not an array
          console.log(
            "No complaints found or invalid response format:",
            response.data
          );
          setComplaints([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch complaints error:", error);
        setError(
          error?.response?.data?.message || "Failed to fetch complaints"
        );
        setLoading(false);
      }
    };

    if (code) {
      fetchComplaints();
    }
  }, [code]);

  const updateComplaintStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const response = await api.post(
        `/api/complaint/updatecomplaint/${id}/${status}`
      );

      // Update the complaint status and re-sort the list
      setComplaints((prevComplaints) => {
        const updated = prevComplaints.map((complaint) =>
          complaint._id === id ? { ...complaint, status } : complaint
        );

        return updated.sort((a, b) => {
          if (a.status === "Pending" && b.status === "Pending") {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          if (a.status === "Pending") return -1;
          if (b.status === "Pending") return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update complaint status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) {
    return (
      <div>
        <AdminHeader />
        <div className="p-4 bg-red-900 border border-red-700 rounded-md text-red-200">
          <h3 className="font-medium mb-2">Error Loading Complaints</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loadingAdmin || loading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  if (complaintsArray.length === 0) {
    return (
      <div>
        <AdminHeader />
        <div className="bg-[#1f2937] p-2 ">
          <Link
            to={`/admin/hostel/${code}`}
            className="ml-[90%] flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft />
            Go Back
          </Link>
          <div className="flex flex-col items-center justify-center h-screen mt-0 p-8 my-8 bg-gray-800 rounded-lg ">
            <div className="bg-blue-900 p-4 rounded-full mb-4">
              <AlertCircle size={48} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No Complaints Found
            </h3>
            <p className="text-gray-300 text-center mb-4">
              There are currently no hostel complaints registered
              <span className="font-medium text-white"></span>.
            </p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 w-full max-w-md">
              <h4 className="text-sm font-medium text-gray-200 mb-2">
                This could mean:
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>All previous issues have been resolved</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>No complaints have been submitted yet</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      <AdminHeader />
      <div className="w-4/5 mx-auto complaints-container text-gray-100 min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">
            Complaints for Hostel <span className="text-white"></span>
          </h2>
          <Link
            to={`/admin/hostel/${code}`}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft />
            Go Back
          </Link>
        </div>

        <div className="complaints-list space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-300">
              Complaints Found{" "}
              <span className="text-blue-400">({complaints?.length})</span>
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>{" "}
                Pending
              </span>
              <span className="flex items-center text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>{" "}
                Resolved
              </span>
              <span className="flex items-center text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>{" "}
                Closed
              </span>
            </div>
          </div>

          {complaints?.map((complaint) => (
            <div
              key={complaint._id}
              className="complaint-card bg-gray-800 rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500 hover:border-blue-400 transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-medium text-white">
                    {complaint.title || "Complaint #" + complaint._id}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      complaint.status === "Resolved"
                        ? "bg-green-900 text-green-300"
                        : complaint.status === "Closed"
                          ? "bg-purple-900 text-purple-300"
                          : "bg-red-900 text-red-300"
                    }`}
                  >
                    {complaint.status || "Pending"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                  <p>
                    <strong className="text-gray-300">Date:</strong>{" "}
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Description:</strong>
                  </p>
                  <p className="text-gray-400 bg-gray-700 p-3 rounded-md">
                    {complaint.description}
                  </p>
                </div>

                {/* Image Gallery Section */}
                {complaint.images && complaint.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-300 mb-2">
                      <strong>Attached Images:</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {complaint.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Complaint evidence ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md border border-gray-600 hover:border-blue-400 transition-all cursor-pointer"
                            onClick={() => window.open(image.url, "_blank")}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {complaint.response && (
                  <div className="response-section mt-4 bg-gray-700 p-4 rounded-md">
                    <h5 className="text-sm font-semibold text-blue-400 mb-2">
                      ADMIN RESPONSE:
                    </h5>
                    <p className="text-gray-300 italic">{complaint.response}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {complaint.status !== "Resolved" &&
                    complaint.status !== "Closed" && (
                      <button
                        onClick={() =>
                          updateComplaintStatus(complaint._id, "Resolved")
                        }
                        disabled={updatingId === complaint._id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                          updatingId === complaint._id
                            ? "bg-green-800 text-green-300"
                            : "bg-green-700 hover:bg-green-600 text-white"
                        }`}
                      >
                        {updatingId === complaint._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Mark as Resolved
                      </button>
                    )}

                  {complaint.status !== "Closed" &&
                    complaint.status !== "Resolved" && (
                      <button
                        onClick={() =>
                          updateComplaintStatus(complaint._id, "Closed")
                        }
                        disabled={updatingId === complaint._id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                          updatingId === complaint._id
                            ? "bg-purple-800 text-purple-300"
                            : "bg-purple-700 hover:bg-purple-600 text-white"
                        }`}
                      >
                        {updatingId === complaint._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Close Complaint
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostelComplaintsPage;
