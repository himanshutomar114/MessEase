import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import { PlusCircle } from "lucide-react";
import { useSelector } from "react-redux";

export const CreateGroupChat = () => {
  const [groupName, setGroupName] = useState("");
  const { user, code: reduxCode } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(""); // Added message state for error handling
  const navigate = useNavigate();
  const location = useLocation();
  console.log(reduxCode);
  const code = reduxCode || location.state.code || "";
  const userId = user._id || location.state.userId || "";
  const { hostelId } = location.state || "";
  const createGroup = async (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      setMessage("");

      try {
        const response = await api.post("/api/admin/createGroupChat", {
          code: code,
          groupName,
          hostelId,
        });
        console.log(response.data);
        if (response.status === 201) {
          navigate(`/admin/hostel/${code}`);
          setGroupCreated(true);
        }
      } catch (error) {
        console.error("Error creating group:", error);
        setMessage("Failed to create group. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <PlusCircle className="w-12 h-12 text-blue-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Create Group Chat
          </h2>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-center">{message}</p>
          </div>
        )}

        <form onSubmit={createGroup} className="space-y-4">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};
