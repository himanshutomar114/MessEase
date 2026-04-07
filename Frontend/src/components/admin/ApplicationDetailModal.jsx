import React from "react";

const ApplicationDetailModal = ({ application, onClose }) => {
  if (!application) return null;

  // Format date to a readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-100">
              Application Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Applicant Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-16 w-16">
                  {application.user?.profilePicture ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={application.user.profilePicture}
                      alt={application.user?.name || "User"}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xl font-semibold">
                      {application.user?.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-100">
                    {application.user?.name || "N/A"}
                  </h4>
                  <p className="text-gray-400">
                    {application.user?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Roll Number</p>
                <p className="font-medium text-gray-100">
                  {application.user?.rollNumber || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Branch</p>
                <p className="font-medium text-gray-100">
                  {application.user?.branch || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Year</p>
                <p className="font-medium text-gray-100">
                  {application.user?.year || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Room</p>
                <p className="font-medium text-gray-100">
                  {application.user?.room || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="font-medium text-gray-100">
                  {application.user?.phoneNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Application Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Position</p>
                <p className="font-medium text-gray-100">
                  {application.position === "messManager"
                    ? "Mess Manager"
                    : application.position === "hostelManager"
                      ? "Hostel Manager"
                      : application.position}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              </div>

              <div>
                <p className="text-sm text-gray-400">Submitted On</p>
                <p className="font-medium text-gray-100">
                  {formatDate(application.submittedAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="font-medium text-gray-100">
                  {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Application Answers */}
          {application.answers && application.answers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-200">
                Application Answers
              </h3>
              <div className="space-y-4">
                {application.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 border-gray-700"
                  >
                    <p className="font-medium text-gray-200 mb-2">
                      Question {index + 1}:
                    </p>
                    <p className="text-gray-400 mb-3">
                      {answer.question || "N/A"}
                    </p>

                    <p className="font-medium text-gray-200 mb-2">Answer:</p>
                    {answer.answer && answer.answer.length > 100 ? (
                      <details className="text-gray-400">
                        <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                          View Answer
                        </summary>
                        <p className="mt-2 p-2 bg-gray-700 rounded">
                          {answer.answer}
                        </p>
                      </details>
                    ) : (
                      <p className="text-gray-400">
                        {answer.answer || "No answer provided"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
