import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUsers,
  FaFileCsv,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../../utils/axiosRequest";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import useAdminAuth from "../../../hooks/useAdminAuth";

const PaidUsersList = () => {
  const { paymentId } = useParams();
  const [paidUsers, setPaidUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();
  const navigate = useNavigate();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  useEffect(() => {
    const fetchPaidUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/payment/paid-users/${paymentId}`);
        if (response.data.success) {
          setPaidUsers(response.data.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load paid users data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchPaidUsers();
  }, [paymentId]);

  const exportToCSV = () => {
    if (!paidUsers.length) return;

    const headers = [
      "Name",
      "Email",
      "Roll Number",
      "Paid Date",
      "Transaction ID",
    ];
    const csvData = paidUsers.map((item) => [
      item.userId?.name || "N/A",
      item.userId?.email || "N/A",
      item.userId?.rollNumber || "N/A",
      new Date(item.paidAt).toLocaleString(),
      item.transactionId || "N/A",
    ]);

    csvData.unshift(headers);
    const csvString = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `paid_users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV file download started");
  };

  if (loading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <AdminHeader />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <AdminHeader />
        <div className="w-4/5 mx-auto min-h-screen text-white p-4 flex justify-center items-center">
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
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link
            to="/admin/payments"
            className="mr-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="text-gray-300 hover:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FaUsers className="mr-3 text-indigo-400" />
              Paid Users List
            </h1>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
            </div>
            <div className="relative">
              <select className="appearance-none px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>

          <button
            onClick={exportToCSV}
            disabled={!paidUsers.length}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold transition-colors ${
              paidUsers.length
                ? "bg-green-600 hover:bg-green-500 shadow-md"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            <FaFileCsv size={18} />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
          {paidUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Student Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Payment Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paidUsers.map((paidUser, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-800 rounded-full flex items-center justify-center text-lg font-bold">
                            {paidUser.userId?.name?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {paidUser.userId?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {paidUser.userId?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-mono bg-gray-700 px-3 py-1 rounded-lg inline-block">
                          {paidUser.userId?.rollNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(paidUser.paidAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(paidUser.paidAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-mono bg-gray-900 text-green-400 px-3 py-1 rounded-lg">
                          {paidUser.transactionId || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
                <FaUsers className="text-gray-400" size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-1">
                No Payments Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No users have paid this fee yet. Check back later or adjust the
                payment settings.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {paidUsers.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing{" "}
              <span className="font-medium text-white">{paidUsers.length}</span>{" "}
              users
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700">
                Previous
              </button>
              <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaidUsersList;
