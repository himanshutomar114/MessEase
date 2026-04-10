import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosRequest";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import {
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEdit,
  FaPlus,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import useAdminAuth from "../../../hooks/useAdminAuth";

const PaymentManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();
  const navigate = useNavigate();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all hostels and payments in parallel
        const [hostelsResponse, paymentsResponse] = await Promise.all([
          api.post("/api/hostel/fetchAllHostels"),
          api.get("/api/payment/all"),
        ]);

        setHostels(hostelsResponse.data.hostels || []);
        setPayments(paymentsResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePaymentStatus = async (paymentId) => {
    try {
      const response = await api.patch(`/api/payment/toggle/${paymentId}`);

      if (response.data.success) {
        // Update payments state with toggled status
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment._id === paymentId
              ? { ...payment, isActive: !payment.isActive }
              : payment
          )
        );

        toast.success(
          `Payment ${response.data.data.isActive ? "enabled" : "disabled"} successfully`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle payment status");
    }
  };

  // New function to delete a payment
  const deletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;

    try {
      const response = await api.delete(`/api/payment/delete/${paymentId}`);
      if (response.data.success) {
        // Remove the deleted payment from state
        setPayments((prevPayments) =>
          prevPayments.filter((payment) => payment._id !== paymentId)
        );
        toast.success("Payment deleted successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment");
    }
  };

  // Find all payments for a hostel
  const getPaymentsForHostel = (hostelId) => {
    return payments.filter((payment) => payment.hostelId._id === hostelId);
  };

  if (loading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-700 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-white">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <AdminHeader />
      <div className="w-4/5 container mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Hostel Fee Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage payment configurations for all hostels
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Search hostels..."
                className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
            </div>
            <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="not-configured">Not Configured</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 rounded-xl shadow-lg border border-indigo-700">
            <h3 className="text-indigo-300 text-sm font-semibold uppercase">
              Active Payments
            </h3>
            <p className="text-3xl font-bold mt-2">
              {payments.filter((p) => p.isActive).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-xl shadow-lg border border-green-700">
            <h3 className="text-green-300 text-sm font-semibold uppercase">
              Total Collection
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₹
              {payments
                .reduce((sum, p) => {
                  return sum + (p.isActive ? p.amount : 0);
                }, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl shadow-lg border border-red-700">
            <h3 className="text-red-300 text-sm font-semibold uppercase">
              Pending Configuration
            </h3>
            <p className="text-3xl font-bold mt-2">
              {hostels.filter((h) => getPaymentsForHostel(h._id).length === 0).length}
            </p>
          </div>
        </div>

        {/* Table - Shows all payments */}
        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Hostel Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Payment Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-750 transition duration-150"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        {payment.hostelId?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Code: {payment.hostelId?.code || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {payment.title}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.isActive
                            ? "bg-green-900/60 text-green-300 border border-green-600"
                            : "bg-red-900/60 text-red-300 border border-red-600"
                        }`}
                      >
                        {payment.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        ₹{payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {payment.dueDate ? (
                        <>
                          <div className="text-sm font-medium text-gray-200">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date() > new Date(payment.dueDate)
                              ? "Overdue"
                              : `${Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left`}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => togglePaymentStatus(payment._id)}
                          className={`p-2 rounded-full ${
                            payment.isActive
                              ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                              : "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                          }`}
                          title={
                            payment.isActive
                              ? "Disable Payment"
                              : "Enable Payment"
                          }
                        >
                          {payment.isActive ? (
                            <FaToggleOn size={18} />
                          ) : (
                            <FaToggleOff size={18} />
                          )}
                        </button>
                        <Link
                          to={`/admin/payment/edit/${payment._id}/${payment.hostelId?._id}`}
                          className="p-2 rounded-full bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50"
                          title="Edit Payment"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <Link
                          to={`/admin/payment/paid-users/${payment._id}`}
                          className="p-2 rounded-full bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                          title="View Paid Users"
                        >
                          <FaEye size={16} />
                        </Link>
                        <button
                          onClick={() => deletePayment(payment._id)}
                          className="p-2 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50"
                          title="Delete Payment"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-gray-400 text-sm">
                      No payments configured yet. Click "Add Payment" for a hostel to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Action: Add Payment Button */}
        <div className="mt-6 flex justify-start">
          <select
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/admin/payment/create/${e.target.value}`);
              }
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center cursor-pointer"
            defaultValue=""
          >
            <option value="">+ Add New Payment</option>
            {hostels.map((hostel) => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-medium text-white">{hostels.length}</span>{" "}
            hostels
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
