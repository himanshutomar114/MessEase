import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SpotlightCard from "../../components/ui/SpotlightCard";

const AdminElectionConfig = () => {
  const [college, setCollege] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [messes, setMesses] = useState([]);
  const [electionConfigs, setElectionConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "messManager",
    targetId: "",
    questions: [
      "Why do you want to be a manager?",
      "What are your past experiences?",
      "What changes would you implement?",
    ],
  });

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelsRes, messesRes, configsRes] = await Promise.all([
          api.post("/api/hostel/fetchAllHostels"),
          api.post("/api/mess/fetchAllMesses"),
          api.get("/api/election/admin/elections"),
        ]);
        console.log("ghrhrsh", configsRes);

        setHostels(hostelsRes.data.hostels);
        setMesses(messesRes.data.data);
        setElectionConfigs(configsRes.data.data);

        if (formData.type === "messManager" && messesRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            targetId: messesRes.data.data[0]._id,
          }));
        } else if (
          formData.type === "hostelManager" &&
          hostelsRes.data.hostels.length > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            targetId: hostelsRes.data.hostels[0]._id,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.log(error.response);
        if (!error.response.data.college) {
          setCollege(false);
        }
        toast.error(error.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      targetId:
        newType === "messManager" && messes.length > 0
          ? messes[0]._id
          : newType === "hostelManager" && hostels.length > 0
            ? hostels[0]._id
            : "",
    }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({ ...prev, questions: [...prev.questions, ""] }));
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/election/admin/elections", formData);
      toast.success("Election configuration created successfully");

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create election configuration"
      );
    }
  };

  const handleToggleApplicationPhase = async (id) => {
    try {
      await api.patch(`/api/election/admin/${id}/toggle-application`);

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);

      toast.success("Application phase toggled successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle application phase"
      );
    }
  };

  const handleToggleVotingPhase = async (id) => {
    try {
      await api.patch(`/api/election/admin/${id}/toggle-voting`);

      const configsRes = await api.get("/api/election/admin/elections");
      setElectionConfigs(configsRes.data.data);

      toast.success("Voting phase toggled successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle voting phase"
      );
    }
  };

  if (college === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8 text-blue-400">
              College not found
            </h1>
            <p className="text-lg">
              College details are required to configure elections.
            </p>
            <p className="text-lg mt-2">
              Please create a college first to proceed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
            Election Management Dashboard
          </h1>
          <Link
            onClick={() => {
              navigate(-1);
            }}
            className="flex items-center text-blue-400 hover:text-blue-200 mb-5"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Previous Page</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Create Election Configuration Form */}
          <SpotlightCard
            className="w-full custom-spotlight-card"
            spotlightColor="rgba(0, 229, 255, 0.2)"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Election
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Election Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={handleTypeChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="messManager">Mess Manager</option>
                    <option value="hostelManager">Hostel Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    {formData.type === "messManager" ? "Mess" : "Hostel"}
                  </label>
                  <select
                    value={formData.targetId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    {formData.type === "messManager"
                      ? messes.map((mess) => (
                          <option key={mess._id} value={mess._id}>
                            {mess.name}
                          </option>
                        ))
                      : hostels.map((hostel) => (
                          <option key={hostel._id} value={hostel._id}>
                            {hostel.name}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">
                    Application Questions
                  </label>

                  <div className="space-y-3">
                    {formData.questions.map((question, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) =>
                            handleQuestionChange(index, e.target.value)
                          }
                          className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder={`Question ${index + 1}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
                          aria-label="Remove question"
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
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Question
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors duration-200 mt-6 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create Election
                </button>
              </form>
            </div>
          </SpotlightCard>

          {/* Existing Elections List */}
          <SpotlightCard
            className="h-full custom-spotlight-card"
            spotlightColor="rgba(0, 229, 255, 0.2)"
          >
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Existing Elections
              </h2>

              {electionConfigs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-lg">No elections configured yet</p>
                  <p className="text-sm mt-2">
                    Create your first election using the form on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {electionConfigs.map((config) => (
                    <div
                      key={config._id}
                      className="border border-gray-700/70 p-5 rounded-xl bg-gray-800/50 backdrop-blur-md hover:border-blue-500/70 transition-all duration-300 shadow-lg hover:shadow-blue-900/20"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-blue-300">
                            {config.type === "messManager"
                              ? "Mess Manager"
                              : "Hostel Manager"}
                            : {config?.name || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Created:{" "}
                            {new Date(config.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 w-full md:w-auto">
                          <button
                            onClick={() =>
                              handleToggleApplicationPhase(config._id)
                            }
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm font-medium transition-colors duration-200 ${
                              config.applicationPhase.isOpen
                                ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400"
                                : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400"
                            }`}
                          >
                            {config.applicationPhase.isOpen
                              ? "Close Applications"
                              : "Open Applications"}
                          </button>

                          <button
                            onClick={() => handleToggleVotingPhase(config._id)}
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm font-medium transition-colors duration-200 ${
                              config.votingPhase.isOpen
                                ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-400"
                                : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-400 disabled:bg-green-800 disabled:opacity-50"
                            }`}
                            disabled={
                              config.applicationPhase.isOpen ||
                              config.votingPhase.candidates.length === 0
                            }
                          >
                            {config.votingPhase.isOpen
                              ? "Close Voting"
                              : "Open Voting"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-lg text-center ${
                            config.applicationPhase.isOpen
                              ? "bg-gradient-to-br from-green-900/40 to-green-800/20 text-green-400 border border-green-700/30"
                              : "bg-gray-750/50 text-gray-400 border border-gray-700/30"
                          }`}
                        >
                          <span className="text-xs uppercase font-medium tracking-wider">
                            Applications
                          </span>
                          <p className="text-sm font-semibold mt-1">
                            {config.applicationPhase.isOpen ? "Open" : "Closed"}
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-lg text-center ${
                            config.votingPhase.isOpen
                              ? "bg-gradient-to-br from-green-900/40 to-green-800/20 text-green-400 border border-green-700/30"
                              : "bg-gray-750/50 text-gray-400 border border-gray-700/30"
                          }`}
                        >
                          <span className="text-xs uppercase font-medium tracking-wider">
                            Voting
                          </span>
                          <p className="text-sm font-semibold mt-1">
                            {config.votingPhase.isOpen ? "Open" : "Closed"}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg text-center bg-gradient-to-br from-blue-900/40 to-blue-800/20 text-blue-400 border border-blue-700/30">
                          <span className="text-xs uppercase font-medium tracking-wider">
                            Candidates
                          </span>
                          <p className="text-sm font-semibold mt-1">
                            {config.votingPhase.candidates.length}
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-lg text-center ${
                            config.result?.winnerId
                              ? "bg-gradient-to-br from-purple-900/40 to-purple-800/20 text-purple-400 border border-purple-700/30"
                              : "bg-gray-750/50 text-gray-400 border border-gray-700/30"
                          }`}
                        >
                          <span className="text-xs uppercase font-medium tracking-wider">
                            Result
                          </span>
                          <p className="text-sm font-semibold mt-1">
                            {config.result?.winnerId ? "Announced" : "Pending"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a
                          href={`/admin/election/${config._id}/applications`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
                        >
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Applications
                        </a>
                        <a
                          href={`/admin/election/${config._id}/results`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center"
                        >
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          View Results
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionConfig;
