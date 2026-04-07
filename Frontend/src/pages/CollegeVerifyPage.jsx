import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";

const CollegeVerifyPage = () => {
  const { code } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true); // Manage loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await api.get(`/api/college/verification/${code}`);
        setCollege(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        toast.error("Error fetching college details");
        setLoading(false); // Stop loading even if there is an error
      }
    };

    fetchCollege();
  }, [code]);

  const handleDecision = async (decision) => {
    try {
      const response = await api.post(`/api/college/verification/${code}`, {
        decision,
      });
      toast.success(response.data.message);
      navigate("/"); // Redirect to home or another page after the decision
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error processing your decision"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading college details...</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">
          No college found with this verification code.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-100 to-blue-200 p-6">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          College Verification
        </h2>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Name:</strong> {college.name}
          </p>
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Domain:</strong> {college.domain}
          </p>
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Website:</strong>{" "}
            {college.website || "N/A"}
          </p>
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Contact Email:</strong>{" "}
            {college.contactEmail}
          </p>
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Contact Phone:</strong>{" "}
            {college.contactPhone}
          </p>
          <p className="text-lg text-gray-700">
            <strong className="font-medium">Address:</strong>{" "}
            {college.address.street}, {college.address.city},{" "}
            {college.address.state}, {college.address.pincode},{" "}
            {college.address.country}
          </p>
        </div>

        {college.status === "unverified" && (
          <div className="mt-8 flex justify-center gap-6">
            <button
              onClick={() => handleDecision("verify")}
              className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Verify
            </button>
            <button
              onClick={() => handleDecision("reject")}
              className="bg-red-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-red-700 transition duration-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeVerifyPage;
