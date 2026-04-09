import { useEffect, useState } from "react";
import axiosRequest from "../../utils/axiosRequest";
import toast from "../../utils/toast";

export default function GuestBookingApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosRequest("GET", "/api/guest/pending-bookings");
      setPendingBookings(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch pending bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await axiosRequest("PATCH", `/api/guest/approve-booking/${bookingId}`);
      toast.success("Booking approved successfully!");
      fetchPendingBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve booking");
    }
  };

  const handleReject = async (bookingId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await axiosRequest("PATCH", `/api/guest/reject-booking/${bookingId}`, {
        rejectionReason,
      });
      toast.success("Booking rejected successfully!");
      setRejectingId(null);
      setRejectionReason("");
      fetchPendingBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject booking");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Guest Room Booking Approvals</h1>
        <p className="text-gray-600 mb-6">
          {pendingBookings.length} pending approval{pendingBookings.length !== 1 ? "s" : ""}
        </p>

        {pendingBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No pending bookings at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Guest Name</p>
                    <p className="font-semibold text-gray-800">{booking.guest?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="text-gray-800 text-sm">{booking.guest?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Roll Number</p>
                    <p className="font-semibold text-gray-800">{booking.guest?.rollNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Room Number</p>
                    <p className="font-semibold text-gray-800 text-lg">{booking.roomNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-gray-600 text-sm">Check-in Date</p>
                    <p className="text-gray-800">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Check-out Date</p>
                    <p className="text-gray-800">{formatDate(booking.checkOutDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Purpose</p>
                    <p className="text-gray-800">{booking.purpose || "Not specified"}</p>
                  </div>
                </div>

                {rejectingId === booking._id ? (
                  <div className="bg-red-50 p-4 rounded mb-4">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows="3"
                      className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(booking._id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(booking._id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
