import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const HostelDetailPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [groupChat, setGroupChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }
  const [hostelId, setHostelId] = useState("");
  const [user, setUser] = useState();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

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

  // Fetch hostel details
  useEffect(() => {
    const fetchHostelDetails = async () => {
      try {
        const response = await api.get(`/api/hostel/${code}`);
        console.log("data is here: ", response.data);
        setHostel(response.data.hostel);
        // Set form default values
        setUser(response.data.user);
        console.log("HD: ", response.data.user);
        setHostelId(response.data.hostel._id);
        // check if group chat is created or not  if not then show create else show see group chat
        setGroupChat(response.data.hostel.chatCreated);

        reset({
          name: response.data.hostel.name,
          location: response.data.hostel.location,
          totalRooms: response.data.hostel.totalRooms,
          roomCapacity: response.data.hostel.roomCapacity,
          guestRooms: {
            count: response.data.hostel.guestRooms.count,
          },
          workers: response.data.hostel.workers || [],
        });
      } catch (error) {
        console.error("Error fetching hostel details:", error);
        toast.error("Could not fetch hostel details");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchHostelDetails();
    }
  }, [code, reset]);

  const onSubmit = async (data) => {
    try {
      // Generate room numbers if guest room count changes
      if (hostel.guestRooms.count !== data.guestRooms.count) {
        const roomNumbers = [];
        for (let i = 1; i <= data.guestRooms.count; i++) {
          roomNumbers.push(`G-${i.toString().padStart(2, "0")}`);
        }
        data.guestRooms.roomNumbers = roomNumbers;
      } else {
        // Keep existing room numbers
        data.guestRooms.roomNumbers = hostel.guestRooms.roomNumbers;
      }

      const response = await api.put(`/api/hostel/update/${code}`, data);
      if (response.data.success) {
        toast.success("Hostel updated successfully");
        setHostel(response.data.hostel);
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating hostel:", error);
      toast.error(error.response?.data?.message || "Error updating hostel");
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form when canceling edit
      reset({
        name: hostel.name,
        location: hostel.location,
        totalRooms: hostel.totalRooms,
        roomCapacity: hostel.roomCapacity,
        guestRooms: {
          count: hostel.guestRooms.count,
        },
        workers: hostel.workers || [],
      });
    }
    setIsEditing(!isEditing);
  };

  if (loading || loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-xl font-semibold">Loading hostel details...</div>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-xl font-semibold text-red-500">
            Hostel not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        {/* <Link
            to={`/admin/home`}
            className="flex items-center text-blue-400 hover:text-blue-200 ml-[85%] mb-5"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Home Page</span>
          </Link> */}
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
          <div className="flex justify-between items-center bg-indigo-700 p-6">
            <h1 className="text-2xl font-bold text-white">Hostel Details</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/home")}
                className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
              >
                Back
              </button>
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded ${
                  isEditing
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {isEditing ? "Cancel" : "Edit Hostel"}
              </button>
              {/* New See Students button */}
              <button
                onClick={() => navigate(`/admin/students`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                See Students
              </button>
            </div>
          </div>

          {isEditing ? (
            // Edit Mode - Form
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-1">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Hostel name is required",
                    })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    {...register("location", {
                      required: "Location is required",
                    })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    {...register("totalRooms", {
                      required: "Total rooms is required",
                      min: { value: 1, message: "Must have at least 1 room" },
                    })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  {errors.totalRooms && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.totalRooms.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">
                    Room Capacity
                  </label>
                  <input
                    type="number"
                    {...register("roomCapacity", {
                      required: "Room capacity is required",
                      min: { value: 1, message: "Capacity must be at least 1" },
                    })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  {errors.roomCapacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.roomCapacity.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-300">
                  Guest Rooms
                </h2>
                <div>
                  <label className="block text-gray-300 mb-1">
                    Number of Guest Rooms
                  </label>
                  <input
                    type="number"
                    {...register("guestRooms.count", {
                      required: "Guest room count is required",
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  />
                  {errors.guestRooms?.count && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.guestRooms.count.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    {hostel.guestRooms.roomNumbers &&
                    hostel.guestRooms.roomNumbers.length > 0
                      ? `Current room numbers: ${hostel.guestRooms.roomNumbers.join(
                          ", "
                        )}`
                      : "No guest rooms currently assigned"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">
                    Workers
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        name: "",
                        mobileNumber: "",
                        work: workOptions[0],
                      })
                    }
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Worker
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border p-4 rounded-md mb-4 border-gray-600"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-200">
                        Worker #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-300 mb-1">Name</label>
                        <input
                          {...register(`workers.${index}.name`, {
                            required: "Worker name is required",
                          })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                        {errors.workers?.[index]?.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.workers[index].name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-1">
                          Mobile Number
                        </label>
                        <input
                          {...register(`workers.${index}.mobileNumber`, {
                            required: "Mobile number is required",
                          })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                        {errors.workers?.[index]?.mobileNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.workers[index].mobileNumber.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-1">
                          Work Type
                        </label>
                        <select
                          {...register(`workers.${index}.work`, {
                            required: "Work type is required",
                          })}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        >
                          {workOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() +
                                option.slice(1).replace(/([A-Z])/g, " $1")}
                            </option>
                          ))}
                        </select>
                        {errors.workers?.[index]?.work && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.workers[index].work.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <p className="text-gray-400 italic mb-4">
                    No workers added yet. Click "Add Worker" to add workers.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
              >
                Update Hostel
              </button>
            </form>
          ) : (
            // View Mode - Display
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-300">
                    Basic Information
                  </h2>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium text-gray-400">Name:</span>{" "}
                      {hostel.name}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">
                        Location:
                      </span>{" "}
                      {hostel.location}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">Code:</span>{" "}
                      {hostel.code}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">
                        Total Rooms:
                      </span>{" "}
                      {hostel.totalRooms}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">
                        Room Capacity:
                      </span>{" "}
                      {hostel.roomCapacity} persons per room
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-300">
                    Guest Rooms
                  </h2>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium text-gray-400">Count:</span>{" "}
                      {hostel.guestRooms.count}
                    </div>
                    {hostel.guestRooms.roomNumbers &&
                      hostel.guestRooms.roomNumbers.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-400">
                            Room Numbers:
                          </span>{" "}
                          {hostel.guestRooms.roomNumbers.join(", ")}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-300">Workers</h2>
                {hostel.workers && hostel.workers.length > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="py-2 px-4 text-left font-medium text-gray-300">
                            Name
                          </th>
                          <th className="py-2 px-4 text-left font-medium text-gray-300">
                            Mobile Number
                          </th>
                          <th className="py-2 px-4 text-left font-medium text-gray-300">
                            Work Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {hostel.workers.map((worker, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 text-gray-200">
                              {worker.name}
                            </td>
                            <td className="py-2 px-4 text-gray-200">
                              {worker.mobileNumber}
                            </td>
                            <td className="py-2 px-4 text-gray-200">
                              {worker.work.charAt(0).toUpperCase() +
                                worker.work.slice(1).replace(/([A-Z])/g, " $1")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 italic mt-2">
                    No workers assigned to this hostel
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                {hostel.mess ? (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate(`/admin/mess/${hostel.code}`);
                    }}
                  >
                    See Mess
                  </button>
                ) : (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate("/admin/mess/create");
                    }}
                  >
                    Add Mess
                  </button>
                )}
                <Link
                  to={`/admin/hostel/complaints/${hostel.code}`}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  See Complaints
                </Link>
                <div>
                  {groupChat ? (
                    <button
                      className="y-5 display: inline bg-gray-500 text-white px-4 py-2 rounded"
                      disabled
                    >
                      GroupChat Created
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        navigate("/admin/create-GroupChat", {
                          state: {
                            code,
                            userId: user._id,
                            hostelId: hostel._id,
                          },
                        });
                      }}
                    >
                      Add Group Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelDetailPage;
