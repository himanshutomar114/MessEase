import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../utils/axiosRequest";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";

const CreateHostelPage = () => {
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
      totalRooms: "",
      roomCapacity: "",
      guestRooms: {
        count: 0,
      },
      workers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workers",
  });

  const workOptions = [
    "roomCleaner",
    "hostelCleaner",
    "gardenCleaner",
    "electrician",
    "accountant",
    "warden",
  ];

  const onSubmit = async (data) => {
    try {
      // Generate room numbers for guest rooms like G-01, G-02, etc.
      const roomNumbers = [];
      for (let i = 1; i <= data.guestRooms.count; i++) {
        roomNumbers.push(`G-${i.toString().padStart(2, "0")}`);
      }

      // Add room numbers to the data
      data.guestRooms.roomNumbers = roomNumbers;

      const response = await api.post("/api/hostel/create-hostel", data);
      toast.success("Hostel created successfully!");
      console.log("Hostel created:", response.data);
      navigate("/admin/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create hostel");
      console.error("Error creating hostel:", error);
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
      <div className="max-w-3xl mx-auto p-6 pt-8">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header Section */}
          <div className="bg-indigo-600 p-5 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white text-center">
              Create New Hostel
            </h1>
            <p className="text-indigo-200 text-center mt-1">
              Fill in the details to set up a new hostel in the system
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Basic Hostel Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-indigo-300 border-b border-gray-700 pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter hostel name"
                    {...register("name", {
                      required: "Hostel name is required",
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State or Address"
                    {...register("location", {
                      required: "Location is required",
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1 font-medium">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    placeholder="Total number of rooms"
                    {...register("totalRooms", {
                      required: "Total rooms is required",
                      min: { value: 1, message: "Must have at least 1 room" },
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.totalRooms && (
                    <p className="text-red-400 text-sm mt-1 font-medium">
                      {errors.totalRooms.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Room Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Persons per room"
                    {...register("roomCapacity", {
                      required: "Room capacity is required",
                      min: { value: 1, message: "Capacity must be at least 1" },
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.roomCapacity && (
                    <p className="text-red-400 text-sm mt-1 font-medium">
                      {errors.roomCapacity.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guest Rooms */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-indigo-300 border-b border-gray-700 pb-2">
                Guest Rooms
              </h2>
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
                <label className="block text-gray-300 mb-2 font-medium">
                  Number of Guest Rooms
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Enter number of guest rooms"
                    {...register("guestRooms.count", {
                      required: "Guest room count is required",
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.guestRooms?.count && (
                  <p className="text-red-400 text-sm mt-1 font-medium">
                    {errors.guestRooms.count.message}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2 flex items-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Room numbers will be automatically generated (e.g., G-01,
                  G-02)
                </p>
              </div>
            </div>

            {/* Workers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-300 border-b border-gray-700 pb-2 flex-grow">
                  Workers
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    append({ name: "", mobileNumber: "", work: workOptions[0] })
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Worker
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border p-5 rounded-lg mb-4 border-gray-600 bg-gray-750 hover:border-indigo-500 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-indigo-300 text-lg">
                        Worker #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center shadow-md"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">
                          Name
                        </label>
                        <input
                          placeholder="Worker's full name"
                          {...register(`workers.${index}.name`, {
                            required: "Worker name is required",
                          })}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        {errors.workers?.[index]?.name && (
                          <p className="text-red-400 text-sm mt-1 font-medium">
                            {errors.workers[index].name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">
                          Mobile Number
                        </label>
                        <input
                          placeholder="Contact number"
                          {...register(`workers.${index}.mobileNumber`, {
                            required: "Mobile number is required",
                          })}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        {errors.workers?.[index]?.mobileNumber && (
                          <p className="text-red-400 text-sm mt-1 font-medium">
                            {errors.workers[index].mobileNumber.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">
                          Work Type
                        </label>
                        <select
                          {...register(`workers.${index}.work`, {
                            required: "Work type is required",
                          })}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                          {workOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() +
                                option.slice(1).replace(/([A-Z])/g, " $1")}
                            </option>
                          ))}
                        </select>
                        {errors.workers?.[index]?.work && (
                          <p className="text-red-400 text-sm mt-1 font-medium">
                            {errors.workers[index].work.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-8 bg-gray-750 rounded-lg border border-dashed border-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-500 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-gray-400">
                      No workers added yet. Click "Add Worker" to begin adding
                      staff.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Create Hostel
              </button>
            </div>
          </form>
        </div>

        {/* Optional: Help Text */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Need help? Contact the admin support team for assistance.
        </div>
      </div>
    </div>
  );
};

export default CreateHostelPage;
