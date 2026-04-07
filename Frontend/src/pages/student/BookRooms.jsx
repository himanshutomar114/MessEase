import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

function BookRooms() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    availableRooms = [],
    checkInDate,
    checkOutDate,
  } = location.state || {};

  const [selectedRoom, setSelectedRoom] = useState("");
  // const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { loadingCheck } = useHostelCheck();
  const isBlocked = useSelector((state) => state.auth.isBlocked);
  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  // Redirect if missing required data
  useEffect(() => {
    if (
      !location.state ||
      !checkInDate ||
      !checkOutDate ||
      !availableRooms.length
    ) {
      toast.error("Missing required booking information");
      navigate("/available-rooms");
    }
  }, [location.state, checkInDate, checkOutDate, availableRooms, navigate]);

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
  };

  const handleSubmit = async () => {
    if (!selectedRoom) {
      toast.error("Please select a room!");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await api.post("/api/guest/book-guest-room", {
        roomNumber: selectedRoom,
        checkInDate,
        checkOutDate,
      });

      if (response.status === 200) {
        toast.success("Room booked successfully!");
        navigate("/student/home");
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to book the room. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (bookingLoading || loadingCheck) {
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
    <div className="bg-gray-900 min-h-screen">
      <Header />
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">
            Select a Guest Room
          </h2>

          <div className="mb-4 text-gray-300">
            <p>
              <span className="font-medium">Check-In:</span>{" "}
              {new Date(checkInDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Check-Out:</span>{" "}
              {new Date(checkOutDate).toLocaleDateString()}
            </p>
          </div>

          {availableRooms.length === 0 ? (
            <p className="text-red-500 text-center">No rooms available.</p>
          ) : (
            <ul className="mb-4 flex flex-wrap gap-2 justify-center">
              {availableRooms.map((room) => (
                <li
                  key={room}
                  onClick={() => handleRoomSelection(room)}
                  className={`w-16 h-16 flex items-center justify-center border rounded cursor-pointer text-center text-lg font-semibold transition duration-200 ${
                    selectedRoom === room
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {room}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleSubmit}
            disabled={bookingLoading || !selectedRoom}
            className={`w-full py-2 rounded transition duration-200 ${
              bookingLoading || !selectedRoom
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {bookingLoading ? "Processing..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookRooms;
