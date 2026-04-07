import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axiosRequest";
import AdminHeader from "../../components/AdminHeader";
import useAdminAuth from "../../hooks/useAdminAuth";
import { ArrowLeft } from "lucide-react";

const MessForm = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      hostel: "",
      location: "",
      capacity: 100,
      workers: [{ name: "", mobileNumber: "" }],
      // A single timing input for each meal type
      mealTimings: {
        breakfast: { hour: 7, minute: 30, am_pm: "am" },
        lunch: { hour: 12, minute: 30, am_pm: "pm" },
        eveningSnacks: { hour: 4, minute: 30, am_pm: "pm" },
        dinner: { hour: 8, minute: 0, am_pm: "pm" },
      },
      // Weekly menu: one row per day, with one field per meal type
      meals: [
        {
          day: "Monday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Tuesday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Wednesday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Thursday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Friday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Saturday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
        {
          day: "Sunday",
          breakfast: "",
          lunch: "",
          eveningSnacks: "",
          dinner: "",
        },
      ],
    },
  });

  const {
    fields: workerFields,
    append: appendWorker,
    remove: removeWorker,
  } = useFieldArray({
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

  // Fetch hostels without mess
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await api.post("/api/hostel/without-mess");
        setHostels(response.data);
      } catch (error) {
        toast.error("Failed to fetch hostels");
        console.error("Error fetching hostels:", error);
      }
    };

    fetchHostels();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const loadingToast = toast.loading("Creating mess...");
    try {
      const response = await api.post("/api/mess/create", data);
      toast.success("Mess created successfully!", { id: loadingToast });
      reset();
      navigate("/admin/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create mess", {
        id: loadingToast,
      });
      console.error("Error creating mess:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-xl font-semibold">Loading</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <AdminHeader />
      <div className="w-4/5 container mx-auto p-4 min-h-screen text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-6">Create New Mess</h1>
          <Link
            onClick={() => {
              navigate(-1);
            }}
            className="flex items-center text-blue-400 hover:text-blue-200"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Previous Page</span>
          </Link>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mess Name*
                </label>
                <input
                  {...register("name", { required: "Mess name is required" })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter mess name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hostel*
                </label>
                <select
                  {...register("hostel", { required: "Hostel is required" })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
                {errors.hostel && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.hostel.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  {...register("location")}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter mess location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  {...register("capacity", { min: 1 })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter mess capacity"
                />
              </div>
            </div>
          </div>

          {/* Workers Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Mess Workers</h2>
            {workerFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-700"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Worker Name
                  </label>
                  <input
                    {...register(`workers.${index}.name`)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter worker name"
                  />
                  {errors.workers?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workers[index].name.message}
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      {...register(`workers.${index}.mobileNumber`)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter mobile number"
                    />
                    {errors.workers?.[index]?.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.workers[index].mobileNumber.message}
                      </p>
                    )}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      className="ml-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => removeWorker(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => appendWorker({ name: "", mobileNumber: "" })}
            >
              Add Worker
            </button>
          </div>

          {/* Meal Timings Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Meal Timings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breakfast Timing */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Breakfast Timing
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...register("mealTimings.breakfast.hour", {
                      min: 1,
                      max: 12,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Hour"
                  />
                  <input
                    type="number"
                    {...register("mealTimings.breakfast.minute", {
                      min: 0,
                      max: 59,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Minute"
                  />
                  <select
                    {...register("mealTimings.breakfast.am_pm")}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              {/* Lunch Timing */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lunch Timing
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...register("mealTimings.lunch.hour", { min: 1, max: 12 })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Hour"
                  />
                  <input
                    type="number"
                    {...register("mealTimings.lunch.minute", {
                      min: 0,
                      max: 59,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Minute"
                  />
                  <select
                    {...register("mealTimings.lunch.am_pm")}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              {/* Evening Snacks Timing */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Evening Snacks Timing
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...register("mealTimings.eveningSnacks.hour", {
                      min: 1,
                      max: 12,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Hour"
                  />
                  <input
                    type="number"
                    {...register("mealTimings.eveningSnacks.minute", {
                      min: 0,
                      max: 59,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Minute"
                  />
                  <select
                    {...register("mealTimings.eveningSnacks.am_pm")}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              {/* Dinner Timing */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dinner Timing
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...register("mealTimings.dinner.hour", {
                      min: 1,
                      max: 12,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Hour"
                  />
                  <input
                    type="number"
                    {...register("mealTimings.dinner.minute", {
                      min: 0,
                      max: 59,
                    })}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Minute"
                  />
                  <select
                    {...register("mealTimings.dinner.am_pm")}
                    className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Food Menu Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Weekly Food Menu</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2 text-left">Day</th>
                    <th className="px-4 py-2 text-left">Breakfast</th>
                    <th className="px-4 py-2 text-left">Lunch</th>
                    <th className="px-4 py-2 text-left">Evening Snacks</th>
                    <th className="px-4 py-2 text-left">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day, index) => (
                    <tr key={day} className="border-b border-gray-700">
                      <td className="px-4 py-2">{day}</td>
                      <td className="px-4 py-2">
                        <input
                          {...register(`meals.${index}.breakfast`)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          placeholder="Items separated by commas"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...register(`meals.${index}.lunch`)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          placeholder="Items separated by commas"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...register(`meals.${index}.eveningSnacks`)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          placeholder="Items separated by commas"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          {...register(`meals.${index}.dinner`)}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                          placeholder="Items separated by commas"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Mess"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessForm;
