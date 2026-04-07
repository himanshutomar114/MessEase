import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const ElectionResultsPage = () => {
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { electionId } = useParams();
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
    const fetchResults = async () => {
      try {
        // Get election details
        const electionResponse = await api.get(`/api/election/${electionId}`);
        console.log(electionResponse.data.data);
        setElection(electionResponse.data.data);

        // Get results
        const resultsResponse = await api.get(
          `/api/election/${electionId}/results`
        );
        console.log(resultsResponse.data.data);
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

  const getWinner = () => {
    console.log(election.result.winnerId);
    return election.result.winnerId;
  };

  const getTotalVotes = () => {
    return results.reduce((sum, result) => sum + result.voteCount, 0);
  };

  if (loading || loadingCheck) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
            <p className="text-indigo-300 animate-pulse">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!election || !results.length) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-center">
            <div className="mb-6 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Results Not Available
            </h2>
            <p className="text-gray-300 mb-8">
              The results for this election have not been announced yet. Please
              check back later.
            </p>
            <button
              onClick={() => navigate("/student/home")}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winner = getWinner();
  const totalVotes = getTotalVotes();
  let voteCount = 0;
  if (winner) {
    const winnerResult = results.find(
      (result) => result.candidate._id === winner._id
    );
    voteCount = winnerResult ? winnerResult.voteCount : 0;
  }

  // Function to create a nice visual for vote percentage
  const renderVotePercentage = (votes) => {
    const percentage = ((votes / totalVotes) * 100).toFixed(1);
    return (
      <div className="w-full">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-indigo-200 font-medium">
            {votes} votes
          </span>
          <span className="text-sm text-indigo-200 font-bold">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-500 h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Election Title Banner */}
        <div className="bg-indigo-900 bg-opacity-50 p-6 rounded-xl shadow-lg border border-indigo-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Election Results
              </h1>
              <p className="text-indigo-200 mt-1">
                {election.type === "messManager"
                  ? "Mess Manager"
                  : "Hostel Manager"}{" "}
                Election
              </p>
            </div>
            <div className="hidden md:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Election Info Card */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 lg:col-span-1">
            <h2 className="font-semibold text-xl mb-4 text-white border-b border-gray-700 pb-2">
              Election Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Election Type</p>
                <p className="text-lg font-medium text-indigo-300">
                  {election.type === "messManager"
                    ? "Mess Manager"
                    : "Hostel Manager"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">
                  {election.type === "messManager" ? "Mess" : "Hostel"} Name
                </p>
                <p className="text-lg font-medium text-white">
                  {election?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Results Announced</p>
                <p className="text-white">
                  {election.result?.announcedAt
                    ? new Date(election.result.announcedAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Not yet announced"}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-gray-400 text-sm">Total Participation</p>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-white">
                    {totalVotes}
                  </span>
                  <span className="text-gray-400 ml-2 mb-1">votes cast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-800 p-6 rounded-xl shadow-lg border-2 border-yellow-500 lg:col-span-2">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-xl mb-4 text-white border-b border-gray-700 pb-2 pr-4">
                Winner
              </h2>
              <div className="bg-yellow-500 text-gray-900 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {winner ? (
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="mb-4 md:mb-0 md:mr-8">
                  <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 p-4 rounded-xl mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold text-white">
                      {winner?.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-700 rounded-md text-gray-300 text-sm">
                        {winner?.branch}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded-md text-gray-300 text-sm">
                        Year {winner?.year}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {((voteCount / totalVotes) * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div
                      className="bg-yellow-500 h-4 rounded-full"
                      style={{
                        width: `${((voteCount / totalVotes) * 100).toFixed(1)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-gray-300">
                    <span className="font-medium">{voteCount}</span> out of{" "}
                    {totalVotes} votes
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">No winner has been declared yet.</p>
            )}
          </div>
        </div>

        {/* Detailed Results Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8">
          <h2 className="font-semibold text-xl mb-6 text-white border-b border-gray-700 pb-2">
            Detailed Results
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-indigo-200">
                  <th className="px-4 py-3 text-left border border-gray-600 rounded-tl-lg">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left border border-gray-600">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left border border-gray-600 hidden md:table-cell">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left border border-gray-600 hidden md:table-cell">
                    Year
                  </th>
                  <th className="px-4 py-3 border border-gray-600 rounded-tr-lg">
                    Results
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={result.candidate._id}
                    className={`border-b border-gray-600 hover:bg-gray-700 transition-colors ${
                      result.isWinner ? "bg-yellow-900 bg-opacity-20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 border border-gray-600 text-center">
                      <span
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                          index === 0
                            ? "bg-yellow-500 text-gray-900"
                            : index === 1
                              ? "bg-gray-500 text-white"
                              : index === 2
                                ? "bg-amber-700 text-white"
                                : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold border border-gray-600">
                      <div className="flex items-center">
                        {result.candidate.name}
                        {result.isWinner && (
                          <span className="ml-2 text-yellow-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="md:hidden mt-1 text-xs text-gray-400">
                        {result.candidate.branch}, Year {result.candidate.year}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-600 hidden md:table-cell">
                      {result.candidate.branch}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 hidden md:table-cell">
                      {result.candidate.year}
                    </td>
                    <td className="px-4 py-3 border border-gray-600">
                      {renderVotePercentage(result.voteCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate("/student/election")}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            All Elections
          </button>

          <button
            onClick={() => navigate("/student/home")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElectionResultsPage;
