import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import api from "../../utils/axiosRequest";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

function AvailableRooms() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();
  const isBlocked = useSelector((state) => state.auth.isBlocked);
  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInDate) {
      setError("Check-in date is required!");
      return;
    }
    if (!checkOutDate) {
      setError("Check-out date is required!");
      return;
    }

    // Validate dates
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (inDate >= outDate) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      const response = await api.post("/api/guest/see-availability", {
        checkInDate,
      });
      console.log("Available room: ", response.data);
      const availableRooms = response.data.freeRooms;
      if (availableRooms.length === 0) {
        setError("No rooms available for the selected dates.");
        return;
      }
      navigate("/book-rooms", {
        state: { availableRooms, checkInDate, checkOutDate },
      });
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setError("Failed to fetch available rooms. Please try again.");
    }
  };

  if (loadingCheck) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-white">
            Book a Guest Room
          </h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <label className="block mb-2 text-white">Check-In Date:</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full border border-gray-600 p-2 rounded mb-4 bg-gray-700 text-white"
            required
            min={new Date().toISOString().split("T")[0]}
          />
          <label className="block mb-2 text-white">Check-Out Date:</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full border border-gray-600 p-2 rounded mb-4 bg-gray-700 text-white"
            required
            min={checkInDate || new Date().toISOString().split("T")[0]}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Check Availability
          </button>
        </form>
      </div>
    </div>
  );
}

export default AvailableRooms;
