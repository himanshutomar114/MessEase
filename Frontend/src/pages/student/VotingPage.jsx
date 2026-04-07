import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const VotingPage = () => {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
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
    const fetchElectionAndCandidates = async () => {
      try {
        // Get election details
        const electionResponse = await api.get(`/api/election/${electionId}`);
        setElection(electionResponse.data.data);

        // Get candidates
        const candidatesResponse = await api.get(
          `/api/election/${electionId}/candidates`
        );
        setCandidates(candidatesResponse.data.data);

        // Check if user has already voted
        try {
          const res = await api.get(`/api/election/${electionId}/my-vote`);
          if (res.data.hasVoted) {
            setHasVoted(true);
          } else setHasVoted(false);
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error("Error checking vote status:", error);
          }
          // 404 means user hasn't voted yet, which is expected
        }

        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch voting information"
        );
        setLoading(false);
      }
    };

    fetchElectionAndCandidates();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/election/vote", {
        electionId,
        candidateId: selectedCandidate,
      });

      toast.success("Vote cast successfully");
      setHasVoted(true);
      setSubmitting(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cast vote");
      setSubmitting(false);
    }
  };

  if (loading || loadingCheck) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!election || !election.votingPhase.isOpen) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-400">
            Voting is not available
          </h2>
          <p className="mt-4 text-gray-300">
            The voting phase for this election is not currently open.
          </p>
          <button
            onClick={() => navigate("/student/home")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-blue-400">
              Vote for{" "}
              {election.type === "messManager"
                ? "Mess Manager"
                : "Hostel Manager"}
            </h1>

            <div className="mb-6 p-4 bg-gray-750 rounded border border-gray-700">
              <h2 className="font-semibold text-lg mb-2 text-blue-300">
                {election.type === "messManager" ? "Mess" : "Hostel"}:{" "}
                {election?.name || "N/A"}
              </h2>
              <p className="text-gray-400">Collge: {election?.collegeName}</p>
              <p className="text-gray-400">
                Voting is open until:{" "}
                {election.votingPhase.openedAt
                  ? new Date(election.votingPhase.openedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            {hasVoted ? (
              <div className="bg-green-900 border border-green-700 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-green-300">
                  You have already cast your vote for this election!
                </h3>
                <p className="mt-2 text-gray-300">
                  Thank you for participating in the election.
                </p>
                <button
                  onClick={() => navigate("/student/home")}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-300">
                    Select a candidate:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.userId._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCandidate === candidate.userId._id
                            ? "border-blue-500 bg-blue-900 bg-opacity-30"
                            : "border-gray-700 hover:border-blue-600"
                        }`}
                        onClick={() =>
                          setSelectedCandidate(candidate.userId._id)
                        }
                      >
                        <h4 className="font-semibold text-lg text-blue-300">
                          {candidate.userId.name}
                        </h4>
                        <p className="text-gray-400">
                          Branch: {candidate.userId.branch}
                        </p>
                        <p className="text-gray-400">
                          Year: {candidate.userId.year}
                        </p>

                        <div className="mt-4">
                          <p className="font-semibold text-gray-300">
                            Application:
                          </p>
                          <div className="mt-2 max-h-36 overflow-y-auto">
                            {candidate.applicationId.answers.map(
                              (qa, index) => (
                                <div
                                  key={index}
                                  className="mb-2 p-2 rounded bg-gray-750 border border-gray-700"
                                >
                                  <p className="text-sm font-medium text-blue-300">
                                    {qa.question}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {qa.answer}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/student/home")}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={!selectedCandidate || submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-900 disabled:opacity-50 transition duration-200"
                  >
                    {submitting ? "Submitting..." : "Cast Vote"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
