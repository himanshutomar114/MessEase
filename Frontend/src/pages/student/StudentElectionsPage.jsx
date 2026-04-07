import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const StudentElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();
  const isBlocked = useSelector((state) => state.auth.isBlocked);
  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get("/api/election/getElections");
        setElections(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch elections"
        );
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  // Helper function to determine the status of the election
  const getElectionStatus = (election) => {
    if (election.applicationPhase.isOpen) {
      return {
        status: "Application Phase",
        color: "bg-blue-900 text-blue-300",
      };
    } else if (election.votingPhase.isOpen) {
      return { status: "Voting Phase", color: "bg-green-900 text-green-300" };
    } else if (election.result && election.result.announcedAt) {
      return {
        status: "Results Announced",
        color: "bg-purple-900 text-purple-300",
      };
    } else {
      return { status: "Pending", color: "bg-gray-700 text-gray-300" };
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !elections || loadingCheck) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  // Group elections by type for better organization
  const messElections = elections.filter(
    (election) => election.type === "messManager"
  );
  const hostelElections = elections.filter(
    (election) => election.type === "hostelManager"
  );

  //Election Card Component
  const ElectionCard = ({ election, status, statusColor, formatDate }) => {
    // Calculate progress percentage based on current status
    const getProgressPercentage = () => {
      if (election.result && election.result.announcedAt) return 100;
      if (election.votingPhase.closedAt) return 75;
      if (election.votingPhase.isOpen) return 50;
      if (election.applicationPhase.closedAt) return 25;
      return 10;
    };

    const progressPercentage = getProgressPercentage();

    return (
      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300 transform hover:-translate-y-1">
        <div className="p-5 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-blue-300">
              {election.type === "messManager"
                ? "Mess Manager"
                : "Hostel Manager"}{" "}
              Election
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
            >
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {election?.name || "Loading..."}
          </p>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Application Phase
            </h4>
            <div className="text-xs text-gray-400 ml-5">
              {election.applicationPhase.isOpen ? (
                <p className="text-green-400 font-medium flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 pulse"></span>
                  Open Now!
                </p>
              ) : (
                <p className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Closed
                </p>
              )}
              <p>Opened: {formatDate(election.applicationPhase.openedAt)}</p>
              {election.applicationPhase.closedAt && (
                <p>Closed: {formatDate(election.applicationPhase.closedAt)}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Voting Phase
            </h4>
            <div className="text-xs text-gray-400 ml-5">
              {election.votingPhase.isOpen ? (
                <p className="text-green-400 font-medium flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 pulse"></span>
                  Open Now!
                </p>
              ) : (
                <p className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  {election.votingPhase.openedAt ? "Closed" : "Not started yet"}
                </p>
              )}
              {election.votingPhase.openedAt && (
                <p>Opened: {formatDate(election.votingPhase.openedAt)}</p>
              )}
              {election.votingPhase.closedAt && (
                <p>Closed: {formatDate(election.votingPhase.closedAt)}</p>
              )}
            </div>
          </div>

          {election.result && election.result.announcedAt && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Results
              </h4>
              <div className="text-xs text-gray-400 ml-5">
                <p>Announced: {formatDate(election.result.announcedAt)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-750 border-t border-gray-700">
          {election.applicationPhase.isOpen && (
            <Link
              to={`/student/election/${election._id}/form`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-2 transition duration-200 font-medium"
            >
              Apply Now
            </Link>
          )}

          {election.votingPhase.isOpen && (
            <Link
              to={`/student/election/${election._id}/voting`}
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md mb-2 transition duration-200 font-medium"
            >
              Vote Now
            </Link>
          )}

          {election.result && election.result.announcedAt && (
            <Link
              to={`/student/election/${election._id}/results`}
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium"
            >
              View Results
            </Link>
          )}

          {!election.applicationPhase.isOpen &&
            !election.votingPhase.isOpen &&
            !election.result?.announcedAt && (
              <Link
                to={`/student/election/${election._id}/details`}
                className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium"
              >
                View Details
              </Link>
            )}
        </div>

        {/* Add a CSS class to create the pulsing effect */}
        <style jsx>{`
          .pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            My Elections
          </h1>
          <div className="text-sm text-gray-400">
            Showing active and past elections
          </div>
        </div>

        {elections.length === 0 ? (
          <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center border border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-gray-400 text-lg">
              No active or completed elections found for your mess or hostel.
            </p>
          </div>
        ) : (
          <>
            {/* Mess Elections Section */}
            {messElections.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold text-blue-300">
                    Mess Elections
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messElections.map((election) => {
                    const { status, color } = getElectionStatus(election);
                    return (
                      <ElectionCard
                        key={election._id}
                        election={election}
                        status={status}
                        statusColor={color}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hostel Elections Section */}
            {hostelElections.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold text-blue-300">
                    Hostel Elections
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostelElections.map((election) => {
                    const { status, color } = getElectionStatus(election);
                    return (
                      <ElectionCard
                        key={election._id}
                        election={election}
                        status={status}
                        statusColor={color}
                        formatDate={formatDate}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentElectionsPage;
