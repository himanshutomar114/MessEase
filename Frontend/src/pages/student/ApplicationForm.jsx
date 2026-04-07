import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const ApplicationForm = () => {
  const [election, setElection] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const fetchElectionDetails = async () => {
      try {
        const response = await api.get(`/api/election/${electionId}`);
        setElection(response.data.data);
        setAnswers(
          Array(response.data.data.applicationPhase.questions.length).fill("")
        );
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch election details"
        );
        setLoading(false);
      }
    };

    fetchElectionDetails();
  }, [electionId]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (answers.some((answer) => !answer.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/election/apply", {
        electionId,
        answers,
      });

      toast.success("Application submitted successfully");
      navigate("/student/home");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingCheck) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!election || !election.applicationPhase.isOpen) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6 w-full">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Application is not available
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                The application phase for this election is not currently open.
              </p>
              <button
                onClick={() => navigate("/student/home")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 font-medium flex items-center mx-auto"
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
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-3xl mx-auto p-6 py-8">
        {/* Title Card */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-t-lg shadow-lg border border-indigo-700/50 mb-1 flex items-center">
          <div className="mr-4">
            <div className="bg-indigo-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Apply for{" "}
              <span className="text-indigo-300">
                {election.type === "messManager"
                  ? "Mess Manager"
                  : "Hostel Manager"}
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Complete the application form below to submit your candidacy
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-gray-800 p-8 rounded-b-lg shadow-xl border border-gray-700">
          {/* Election Info Card */}
          <div className="mb-8 p-5 bg-indigo-900/20 rounded-lg border border-indigo-700/30 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg mb-1 text-indigo-300">
                {election.type === "messManager" ? "Mess" : "Hostel"}:{" "}
                <span className="text-white">{election?.name || "N/A"}</span>
              </h2>
              <div className="flex items-center text-gray-300 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-indigo-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Applications close on:{" "}
                <span className="font-medium ml-1">
                  {election.applicationPhase.openedAt
                    ? new Date(
                        election.applicationPhase.openedAt
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
              <span className="text-green-400 text-sm font-medium">
                Applications Open
              </span>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-700 pb-2 mb-6">
              <h3 className="text-xl font-medium text-indigo-300">
                Application Questions
              </h3>
              <p className="text-gray-400 text-sm">
                Please answer all questions thoughtfully to strengthen your
                candidacy
              </p>
            </div>

            {election.applicationPhase.questions.map((question, index) => (
              <div
                key={index}
                className="mb-8 bg-gray-750 rounded-lg p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300"
              >
                <label className="block text-gray-200 font-medium mb-3 items-start">
                  <span className="bg-indigo-500/20 text-indigo-300 rounded-full h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{question}</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 placeholder:text-gray-500"
                  rows={5}
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  required
                  placeholder="Your response..."
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Be clear and concise</span>
                  <span>{answers[index]?.length || 0} characters</span>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-10 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => navigate("/student/home")}
                className="px-5 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-indigo-500/20"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      className="h-5 w-5 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Box */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-gray-400">
            Need help with your application? Contact the election committee at{" "}
            <span className="text-indigo-400">
              election-support@university.edu
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
