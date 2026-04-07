// src/components/CreateCollegePage.js
import React from "react";
import { useForm } from "react-hook-form";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";

const CreateCollegePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin } = useAdminAuth();

  const onSubmit = async (data) => {
    try {
      await api.post("/api/college/create", data);
      toast.success("College request submitted. Await verification.");
      navigate("/admin/home"); // Redirect back to Admin Home
    } catch (error) {
      console.log(error.response);
      toast.error(
        error.response?.data?.message || "Error creating college request"
      );
    }
  };

  if (loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <AdminHeader />
      <div className="w-4/5 mx-auto min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="max-w-xl w-full bg-gray-800 p-8 rounded shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-indigo-300">
            Create College
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-300">College Name</label>
              <input
                type="text"
                {...register("name", { required: "College name is required" })}
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-300">Domain</label>
              <input
                type="text"
                {...register("domain", { required: "Domain is required" })}
                placeholder="e.g., mnnit.ac.in"
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              {errors.domain && (
                <p className="text-red-500 text-sm">{errors.domain.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-300">Admin Post</label>
              <input
                type="text"
                {...register("adminPost", {
                  required: "Your post in college is required",
                })}
                placeholder="e.g., Registrar, Dean"
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              {errors.adminPost && (
                <p className="text-red-500 text-sm">
                  {errors.adminPost.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-300">Website</label>
              <input
                type="text"
                {...register("website")}
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300">Contact Email</label>
              <input
                type="email"
                {...register("contactEmail", {
                  required: "Contact email is required",
                })}
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-300">Contact Phone</label>
              <input
                type="text"
                {...register("contactPhone", {
                  required: "Contact phone is required",
                })}
                className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mt-4 text-gray-300">
                College Address
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  {...register("address.street", {
                    required: "Street is required",
                  })}
                  placeholder="Street"
                  className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <input
                  type="text"
                  {...register("address.city", {
                    required: "City is required",
                  })}
                  placeholder="City"
                  className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <input
                  type="text"
                  {...register("address.state", {
                    required: "State is required",
                  })}
                  placeholder="State"
                  className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <input
                  type="text"
                  {...register("address.pincode", {
                    required: "Pincode is required",
                  })}
                  placeholder="Pincode"
                  className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
                <input
                  type="text"
                  {...register("address.country", {
                    required: "Country is required",
                  })}
                  placeholder="Country"
                  className="w-full bg-gray-700 border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCollegePage;
