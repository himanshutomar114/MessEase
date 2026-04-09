import { useEffect, useState } from "react";
import axiosRequest from "../../utils/axiosRequest";
import toast from "../../utils/toast";

export default function GuestBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    // Auto-refresh every 5 seconds to show updates from admin actions
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosRequest("GET", "/api/guest/booked-guest-rooms");
      console.log("Guest bookings data:", response.data);
      setBookings(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await axiosRequest("DELETE", `/api/guest/cancel-booking?bookingId=${bookingId}`);
      toast.success("Booking cancelled successfully!");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (booking) => {
    const status = booking.approvalStatus || booking.status || "pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Booked Rooms</h1>
        
        <button
          onClick={fetchBookings}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold"
        >
          🔄 Refresh
        </button>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">You haven't booked any guest rooms yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                {/* Room Header with Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-gray-500 text-sm font-semibold">Room</p>
                    <h2 className="text-2xl font-bold text-gray-800">{booking.roomNumber}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.approvalStatus || booking.status)}`}>
                    {getStatusDisplay(booking)}
                  </span>
                </div>

                {/* Hostel Name */}
                <p className="text-gray-600 font-semibold mb-4">{booking.hostel?.name}</p>

                {/* Check-in and Check-out */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <p className="text-gray-700">
                    <span className="font-semibold">Check-In:</span> {formatDate(booking.checkInDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Check-Out:</span> {formatDate(booking.checkOutDate)}
                  </p>
                </div>

                {/* Status Messages */}
                {booking.approvalStatus === "pending" && (
                  <div className="bg-yellow-50 p-3 rounded mb-4 text-yellow-800 text-sm border border-yellow-200">
                    ⏳ <span className="font-semibold">Pending Approval</span>
                  </div>
                )}

                {booking.approvalStatus === "approved" && (
                  <div className="bg-green-50 p-3 rounded mb-4 text-green-800 text-sm border border-green-200">
                    ✓ <span className="font-semibold">Approved</span>
                  </div>
                )}

                {booking.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded mb-4 border-l-4 border-red-500">
                    <p className="text-red-800 text-sm">
                      <span className="font-semibold">❌ Rejected</span><br />
                      {booking.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Approval Date */}
                {booking.approvalDate && (
                  <p className="text-gray-500 text-xs mb-4">
                    Updated: {new Date(booking.approvalDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {/* Cancel Button */}
                {booking.approvalStatus !== "rejected" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
