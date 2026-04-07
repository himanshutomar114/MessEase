// pages/AdminElectionResults.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminHeader from "../../components/AdminHeader";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useAdminAuth from "../../hooks/useAdminAuth";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminElectionResults = () => {
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const electionResponse = await api.get(`/api/election/${electionId}`);
        setElection(electionResponse.data.data);
        console.log("sgs", electionResponse);

        const resultsResponse = await api.get(
          `/api/election/${electionId}/results`
        );
        console.log("res", resultsResponse);
        setResults(resultsResponse.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch election results"
        );
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  const getTotalVotes = () =>
    results.reduce((sum, result) => sum + result.voteCount, 0);

  const getChartData = () => {
    const labels = results.map((result) => result.candidate.name);
    const data = results.map((result) => result.voteCount);
    const backgroundColors = results.map((result) =>
      result.isWinner ? "rgba(72, 187, 120, 0.8)" : "rgba(66, 153, 225, 0.6)"
    );

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderColor: results.map((result) =>
            result.isWinner ? "rgba(72, 187, 120, 1)" : "rgba(66, 153, 225, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-gray-300">Loading election results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!election || !results.length) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AdminHeader />
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800 rounded-lg shadow-lg mt-16">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-500">
            Results Not Available
          </h2>
          <p className="mt-4 text-gray-300">
            The results for this election have not been announced yet.
          </p>
          <button
            onClick={() => navigate("/admin/election")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const winner = election?.result?.winnerId;
  const totalVotes = getTotalVotes();
  let voteCount = 0;
  if (winner) {
    const winnerResult = results.find(
      (result) => result.candidate._id === winner._id
    );
    voteCount = winnerResult ? winnerResult.voteCount : 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Election Results Dashboard
          </h1>
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <h2 className="font-semibold text-xl mb-4 flex items-center text-blue-300">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Election Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Type:</span>{" "}
                  <span className="px-2 py-1 bg-indigo-900 rounded-md text-indigo-200">
                    {election.type === "messManager"
                      ? "Mess Manager"
                      : "Hostel Manager"}
                  </span>
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Target:</span>{" "}
                  {election?.name || "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">College:</span>{" "}
                  {election?.collegeName || "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Created:</span>{" "}
                  {new Date(election.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">
                    Results Announced:
                  </span>{" "}
                  {election.result?.announcedAt
                    ? new Date(election.result.announcedAt).toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">
                    Total Votes Cast:
                  </span>{" "}
                  <span className="text-white font-bold">{totalVotes}</span>
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">
                    Total Candidates:
                  </span>{" "}
                  <span className="text-white font-bold">{results.length}</span>
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Status:</span>{" "}
                  <span className="px-2 py-1 bg-green-900 rounded-md text-green-200">
                    Results Published
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-center">
            <h3 className="text-lg font-semibold mb-4 text-blue-300 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
              Vote Distribution
            </h3>
            <div className="w-full h-56 flex justify-center">
              {results.length > 0 && (
                <Chart
                  type="pie"
                  data={getChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "#CBD5E0",
                          padding: 10,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const percentage = (
                              (value / totalVotes) *
                              100
                            ).toFixed(1);
                            return `${label}: ${value} votes (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {winner && (
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 border border-green-700 p-6 rounded-lg shadow-lg mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-2xl font-semibold text-green-300 text-center">
                Winner
              </h3>
            </div>

            <div className="bg-black bg-opacity-20 p-4 rounded-lg">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-2">
                  {winner.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  <p className="text-gray-200">
                    <span className="font-semibold">Email:</span> {winner.email}
                  </p>
                  <p className="text-gray-200">
                    <span className="font-semibold">Branch:</span>{" "}
                    {winner.branch}
                  </p>
                  <p className="text-gray-200">
                    <span className="font-semibold">Year:</span> {winner.year}
                  </p>
                </div>
                <div className="mt-4 bg-green-800 py-2 px-4 rounded-lg inline-block">
                  <p className="text-xl font-bold text-green-200">
                    {voteCount} votes (
                    {((voteCount / totalVotes) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="p-4 bg-gray-700 border-b border-gray-600">
            <h3 className="text-xl font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Detailed Candidate Results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Candidate Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-right">Votes</th>
                  <th className="px-4 py-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.map((result, index) => (
                  <tr
                    key={result.candidate._id}
                    className={`hover:bg-gray-700 transition-colors duration-150 ${
                      result.isWinner ? "bg-green-900 bg-opacity-40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      {index + 1 === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-gray-900 font-bold">
                          1
                        </span>
                      ) : index + 1 === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-gray-900 font-bold">
                          2
                        </span>
                      ) : index + 1 === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-700 text-gray-900 font-bold">
                          3
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {result.candidate.name}{" "}
                      {result.isWinner && (
                        <span className="ml-2 text-xs font-bold px-2 py-1 bg-green-700 text-green-200 rounded-full">
                          Winner
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{result.candidate.email}</td>
                    <td className="px-4 py-3">{result.candidate.branch}</td>
                    <td className="px-4 py-3">{result.candidate.year}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {result.voteCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              result.isWinner ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{
                              width: `${(result.voteCount / totalVotes) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {((result.voteCount / totalVotes) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 mr-4 flex items-center shadow-md"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Results
          </button>
          <button
            onClick={() => navigate("/admin/election")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionResults;
