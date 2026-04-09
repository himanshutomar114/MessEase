import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const BookedRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
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

  // Auto-refresh every 5 seconds to show approval status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookedRooms();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusDisplay = (room) => {
    const status = room.approvalStatus || room.status || "pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const fetchBookedRooms = async () => {
    try {
      const response = await api.get(`/api/guest/booked-guest-rooms`);
      console.log(response.data);
      setBookedRooms(response.data);
    } catch (error) {
      console.error("Error fetching booked rooms:", error);
      toast.error("Failed to fetch booked rooms");
    }
  };

  useEffect(() => {
    fetchBookedRooms();
  }, []);

  const handleCancelBooking = async (id) => {
    setLoadingId(id);
    try {
      // Send bookingId as a query parameter
      const res = await api.delete(`/api/guest/cancel-booking?bookingId=${id}`);
      console.log(res);
      toast.success("Booking cancelled successfully");
      fetchBookedRooms(); // Refresh the list
    } catch (error) {
      console.log(error);
      console.error("Error canceling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setLoadingId(null);
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
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-lg mx-auto bg-gray-800 shadow-lg rounded-lg p-6 mt-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">
          Booked Rooms
        </h2>
        {bookedRooms?.length === 0 ? (
          <p className="text-gray-400 text-center">No rooms booked yet.</p>
        ) : (
          <ul className="space-y-4">
            {bookedRooms?.map((room) => (
              <li
                key={room._id}
                className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      Room {room.roomNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(room.approvalStatus || room.status)}`}>
                      {getStatusDisplay(room)}
                    </span>
                  </div>
                  <p className="text-gray-300">
                    <span className="font-medium">Check-In:</span>{" "}
                    {new Date(room.checkInDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Check-Out:</span>{" "}
                    {new Date(room.checkOutDate).toLocaleDateString()}
                  </p>
                  {room.approvalStatus === "pending" && (
                    <p className="text-yellow-300 text-xs mt-2">
                      ⏳ Waiting for admin approval
                    </p>
                  )}
                  {room.approvalStatus === "approved" && (
                    <p className="text-green-300 text-xs mt-2">
                      ✓ Approved - Ready to check-in
                    </p>
                  )}
                  {room.rejectionReason && (
                    <p className="text-red-300 text-xs mt-2">
                      ❌ {room.rejectionReason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCancelBooking(room._id)}
                  disabled={loadingId === room._id}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    loadingId === room._id
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {loadingId === room._id ? "Canceling..." : "Cancel"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookedRooms;
