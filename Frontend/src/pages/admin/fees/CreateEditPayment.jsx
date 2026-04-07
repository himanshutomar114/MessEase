import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegEdit, FaPlusCircle } from "react-icons/fa";
import api from "../../../utils/axiosRequest";
import toast from "react-hot-toast";
import AdminHeader from "../../../components/AdminHeader";
import useAdminAuth from "../../../hooks/useAdminAuth";

const CreateEditPayment = () => {
  const { hostelId, paymentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(paymentId);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  const [formData, setFormData] = useState({
    amount: "",
    title: "",
    description: "",
    dueDate: "",
    isActive: true,
  });

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedHostel = null;
        if (hostelId) {
          const hostelResponse = await api.get(`/api/hostel/${hostelId}`);
          fetchedHostel = hostelResponse.data.hostel;
          setHostel(fetchedHostel);
        }

        if (paymentId && fetchedHostel) {
          const paymentResponse = await api.get(
            `/api/payment/hostel/${fetchedHostel._id}`
          );
          const payment = paymentResponse.data.data;
          setFormData({
            amount: payment.amount,
            title: payment.title,
            description: payment.description || "",
            dueDate: payment.dueDate
              ? new Date(payment.dueDate).toISOString().split("T")[0]
              : "",
            isActive: payment.isActive,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hostelId, paymentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        hostelId: hostel._id,
      };

      const response = await api.post("/api/payment/create", payload);

      if (response.data.success) {
        toast.success(
          `Payment ${isEditMode ? "updated" : "created"} successfully`
        );
        navigate("/admin/payments");
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} payment`);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <AdminHeader />
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Enhanced Header with Animation and Visual Appeal */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center text-white">
            <span className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg">
              {isEditMode ? (
                <FaRegEdit className="text-white text-xl" />
              ) : (
                <FaPlusCircle className="text-white text-xl" />
              )}
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {isEditMode ? "Edit Payment" : "Create New Payment"}
            </span>
          </h1>
          <p className="text-gray-400 mt-2 ml-12">
            {isEditMode
              ? "Update payment details for your hostel residents"
              : "Set up a new payment requirement for hostel residents"}
          </p>
        </div>

        {/* Hostel Information Card with Improved Styling */}
        {hostel && (
          <div className="bg-gray-800 p-5 rounded-lg mb-6 border border-gray-700 shadow-lg transform hover:scale-101 transition-transform duration-200">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-xl text-white">
                  Hostel:{" "}
                  <span className="font-normal text-blue-300">
                    {hostel.name}
                  </span>
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card with Enhanced Design */}
        <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-blue-300">
              Payment Details
            </h3>
            <p className="text-gray-400 text-sm">
              Fill in all required fields marked with *
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  className="block text-gray-300 text-sm font-bold mb-2 items-center"
                  htmlFor="title"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  </svg>
                  Payment Title<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Hostel Fee 2023-24"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  className="block text-gray-300 text-sm font-bold mb-2 items-center"
                  htmlFor="amount"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Amount (₹)<span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-400">₹</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 15000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
                <label
                  className="block text-gray-300 text-sm font-bold mb-2 items-center"
                  htmlFor="description"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Payment details and instructions"
                  rows="4"
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Include any specific instructions for students regarding this
                  payment
                </p>
              </div>

              <div className="mb-5">
                <label
                  className="block text-gray-300 text-sm font-bold mb-2 items-center"
                  htmlFor="dueDate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="mb-8 bg-gray-750 p-4 rounded-lg border border-gray-600">
                <label className="flex items-center text-gray-200 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`block w-12 h-6 rounded-full transition duration-200 ease-in-out ${formData.isActive ? "bg-blue-500" : "bg-gray-600"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition duration-200 ease-in-out ${formData.isActive ? "transform translate-x-6" : ""}`}
                    ></div>
                  </div>
                  <span className="ml-3 font-medium">
                    {formData.isActive ? "Payment Enabled" : "Payment Disabled"}
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-2 ml-15">
                  {formData.isActive
                    ? "Students will be able to see and pay this fee immediately"
                    : "Enable this when you want students to see and pay this fee"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/admin/payments")}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-5 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${submitting ? "opacity-75 cursor-not-allowed" : ""}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {isEditMode ? "Update Payment" : "Create Payment"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-800">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-300">
                Payment Tips
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Be sure to provide clear payment instructions and set reasonable
                due dates. Students will receive notifications about new payment
                requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPayment;
