import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import toast from "react-hot-toast";
import useAdminAuth from "../../hooks/useAdminAuth";
import { ArrowLeft } from "lucide-react";

const GuestRoomBookingsPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  const [hostel, setHostel] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [hostelId, setHostelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, active, history
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const fetchHostelDetails = async () => {
      try {
        const response = await api.get(`/api/hostel/${code}`);
        setHostel(response.data.hostel);
        setHostelId(response.data.hostel._id);
      } catch (error) {
        console.error("Error fetching hostel:", error);
        toast.error("Failed to fetch hostel details");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchHostelDetails();
    }
  }, [code]);

  useEffect(() => {
    if (hostelId) {
      fetchAllBookings();
    }
  }, [hostelId]);

  const fetchAllBookings = async () => {
    try {
      const results = await Promise.allSettled([
        api.get("/api/guest/pending-bookings", { params: { hostelId } }),
        api.get("/api/guest/active-bookings", { params: { hostelId } }),
        api.get("/api/guest/booking-history", { params: { hostelId } }),
      ]);

      // Check each result
      if (results[0].status === "fulfilled") {
        setPendingBookings(results[0].value.data);
      } else {
        console.error("Error fetching pending bookings:", results[0].reason.response?.data);
        toast.error("Pending: " + (results[0].reason.response?.data?.error || "Failed to fetch"));
      }

      if (results[1].status === "fulfilled") {
        setActiveBookings(results[1].value.data);
      } else {
        console.error("Error fetching active bookings:", results[1].reason.response?.data);
        toast.error("Active: " + (results[1].reason.response?.data?.error || "Failed to fetch"));
      }

      if (results[2].status === "fulfilled") {
        setBookingHistory(results[2].value.data);
      } else {
        console.error("Error fetching booking history:", results[2].reason.response?.data);
        toast.error("History: " + (results[2].reason.response?.data?.error || "Failed to fetch"));
      }
    } catch (error) {
      console.error("Error in fetchAllBookings:", error);
      toast.error("Error loading bookings");
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.patch(`/api/guest/approve-booking/${bookingId}`);
      toast.success("Booking approved successfully!");
      fetchAllBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve booking");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await api.patch(`/api/guest/reject-booking/${bookingId}`, {
        rejectionReason,
      });
      toast.success("Booking rejected successfully!");
      setRejectingId(null);
      setRejectionReason("");
      fetchAllBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject booking");
    }
  };

  const renderBookingCard = (booking) => (
    <div key={booking._id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <div>
          <p className="text-gray-400 text-sm">Guest</p>
          <p className="font-semibold text-white">{booking.guest?.name}</p>
          <p className="text-gray-300 text-sm">{booking.guest?.email}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Room</p>
          <p className="font-semibold text-white text-lg">{booking.roomNumber}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Check-in</p>
          <p className="text-white">{new Date(booking.checkInDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Check-out</p>
          <p className="text-white">
            {new Date(booking.checkOutDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {activeTab === "pending" && (
        <>
          {rejectingId === booking._id ? (
            <div className="bg-gray-600 p-3 rounded mt-3">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="2"
                className="w-full p-2 bg-gray-700 text-white border border-gray-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleRejectBooking(booking._id)}
                  className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApproveBooking(booking._id)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setRejectingId(booking._id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm"
              >
                ✗ Reject
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderHistoryCard = (booking) => {
    let statusColor = "bg-gray-700";
    let statusText = booking.approvalStatus;

    if (booking.approvalStatus === "approved") statusColor = "bg-green-700";
    if (booking.approvalStatus === "pending") statusColor = "bg-yellow-700";
    if (booking.approvalStatus === "rejected") statusColor = "bg-red-700";
    if (booking.approvalStatus === "cancelled") statusColor = "bg-orange-700";

    return (
      <div
        key={booking._id}
        className={`${statusColor} p-3 rounded-lg border border-gray-600`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-white font-semibold">
              Room {booking.roomNumber} - {booking.guest?.name}
            </p>
            <p className="text-gray-300 text-sm">
              {booking.guest?.email}
            </p>
            <p className="text-gray-300 text-sm">
              {new Date(booking.checkInDate).toLocaleDateString()} →{" "}
              {new Date(booking.checkOutDate).toLocaleDateString()}
            </p>
          </div>
          <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-semibold">
            {statusText.toUpperCase()}
          </span>
        </div>

        {booking.cancellationReason && (
          <p className="text-red-200 text-sm">
            Cancelled: {booking.cancellationReason}
          </p>
        )}
        {booking.rejectionReason && (
          <p className="text-red-200 text-sm">
            Rejected: {booking.rejectionReason}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <AdminHeader />
      <div className="max-w-6xl mx-auto bg-gray-800 shadow-lg rounded-lg p-6 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(`/admin/hostel/${code}`)}
              className="flex items-center text-blue-400 hover:text-blue-300 mb-2"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Hostel
            </button>
            <h1 className="text-3xl font-bold text-white">Guest Room Bookings</h1>
            <p className="text-gray-400 mt-1">{hostel?.name}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "pending"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "active"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Active ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "history"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            History ({bookingHistory.length})
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "pending" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Pending Approval Requests
              </h2>
              {pendingBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No pending bookings
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map(renderBookingCard)}
                </div>
              )}
            </div>
          )}

          {activeTab === "active" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Currently Active Bookings
              </h2>
              {activeBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No active bookings
                </p>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-green-900 p-4 rounded-lg border border-green-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-300 text-sm">Guest</p>
                          <p className="font-semibold text-white">
                            {booking.guest?.name}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {booking.guest?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">Room</p>
                          <p className="font-semibold text-white text-lg">
                            {booking.roomNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">Check-in</p>
                          <p className="text-white">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">Check-out</p>
                          <p className="text-white">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Booking History
              </h2>
              {bookingHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No booking history
                </p>
              ) : (
                <div className="space-y-3">
                  {bookingHistory.map(renderHistoryCard)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestRoomBookingsPage;
