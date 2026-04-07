import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../utils/axiosRequest.js";
import { Star, ArrowLeft, Clock } from "lucide-react";
import AdminHeader from "../../components/AdminHeader.jsx";
import toast from "react-hot-toast";
import useAdminAuth from "../../hooks/useAdminAuth.js";

const MessDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messData, setMessData] = useState(null);
  const [weeklyFoodData, setWeeklyFoodData] = useState(null);
  const [editingMess, setEditingMess] = useState(false);
  const [editingFood, setEditingFood] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    register: registerFood,
    handleSubmit: handleSubmitFood,
    setValue: setValueFood,
    formState: { errors: errorsFood },
  } = useForm();

  // Fetch mess details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mess/${code}`);
        // console.log(response);
        setMessData(response.data.data.mess);
        setWeeklyFoodData(response.data.data.weeklyFood);
        setLoading(false);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch mess details"
        );
        setError(err.response?.data?.message || "Failed to fetch mess details");
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  // Set form values when editing mess
  useEffect(() => {
    if (editingMess && messData) {
      setValue("name", messData.name);
      setValue("location", messData.location);
      setValue("capacity", messData.capacity);
      setValue("notice", messData.notice);
      if (messData.workers && messData.workers.length > 0) {
        messData.workers.forEach((worker, index) => {
          setValue(`workers[${index}].name`, worker.name);
          setValue(`workers[${index}].mobileNumber`, worker.mobileNumber);
        });
      }
    }
  }, [editingMess, messData, setValue]);

  // Set form values when editing food
  useEffect(() => {
    if (editingFood && weeklyFoodData) {
      weeklyFoodData.meals.forEach((meal, index) => {
        setValueFood(`meals[${index}].day`, meal.day);

        // Breakfast
        setValueFood(`meals[${index}].breakfast.items`, meal.breakfast.items);
        setValueFood(
          `meals[${index}].breakfast.timing.hour`,
          meal.breakfast.timing.hour
        );
        setValueFood(
          `meals[${index}].breakfast.timing.minute`,
          meal.breakfast.timing.minute
        );
        setValueFood(
          `meals[${index}].breakfast.timing.am_pm`,
          meal.breakfast.timing.am_pm
        );

        // Lunch
        setValueFood(`meals[${index}].lunch.items`, meal.lunch.items);
        setValueFood(
          `meals[${index}].lunch.timing.hour`,
          meal.lunch.timing.hour
        );
        setValueFood(
          `meals[${index}].lunch.timing.minute`,
          meal.lunch.timing.minute
        );
        setValueFood(
          `meals[${index}].lunch.timing.am_pm`,
          meal.lunch.timing.am_pm
        );

        // Evening Snacks
        setValueFood(
          `meals[${index}].eveningSnacks.items`,
          meal.eveningSnacks.items
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.hour`,
          meal.eveningSnacks.timing.hour
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.minute`,
          meal.eveningSnacks.timing.minute
        );
        setValueFood(
          `meals[${index}].eveningSnacks.timing.am_pm`,
          meal.eveningSnacks.timing.am_pm
        );

        // Dinner
        setValueFood(`meals[${index}].dinner.items`, meal.dinner.items);
        setValueFood(
          `meals[${index}].dinner.timing.hour`,
          meal.dinner.timing.hour
        );
        setValueFood(
          `meals[${index}].dinner.timing.minute`,
          meal.dinner.timing.minute
        );
        setValueFood(
          `meals[${index}].dinner.timing.am_pm`,
          meal.dinner.timing.am_pm
        );
      });
    }
  }, [editingFood, weeklyFoodData, setValueFood]);

  // Submit handler for mess details
  const onSubmitMess = async (data) => {
    try {
      const response = await api.put(`/api/mess/${code}`, data);
      setMessData(response.data.data);
      setEditingMess(false);
      toast.success("Mess details updated successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update mess details"
      );
    }
  };

  function convertMealItemsToArrays(data) {
    // Create a deep copy of the data to avoid mutating the original
    const newData = JSON.parse(JSON.stringify(data));

    // Process each day in the meals array
    newData.meals.forEach((day) => {
      // List of meal types to process
      const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];

      // Process each meal type
      mealTypes.forEach((mealType) => {
        if (day[mealType] && day[mealType].items) {
          // If items is already an array, leave it as is
          if (Array.isArray(day[mealType].items)) {
            return;
          }

          // If items is a string, split by comma and trim each item
          if (typeof day[mealType].items === "string") {
            day[mealType].items = day[mealType].items
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0);
          }
        }
      });
    });

    return newData;
  }

  // Submit handler for food details
  const onSubmitFood = async (data) => {
    try {
      const newData = convertMealItemsToArrays(data);
      const response = await api.put(`/api/mess/${code}/food`, newData);
      setWeeklyFoodData(response.data.data);
      setEditingFood(false);
      toast.success("Food details updated successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update food details"
      );
    }
  };

  // Add new worker field
  const addWorker = () => {
    const workerCount = messData.workers?.length || 0;
    setValue(`workers[${workerCount}].name`, "");
    setValue(`workers[${workerCount}].mobileNumber`, "");
  };

  const formatTime = (timing) => {
    if (!timing) return "N/A";
    const minute = timing.minute.toString().padStart(2, "0");
    return `${timing.hour}:${minute} ${timing.am_pm}`;
  };

  // Generate random ratings for demonstration
  const getRating = (day, mealType) => {
    // Find the meal object for the specified day
    const mealObj = weeklyFoodData.meals.find((meal) => meal.day === day);
    if (
      mealObj &&
      mealObj[mealType] &&
      typeof mealObj[mealType].averageRating === "number"
    ) {
      return mealObj[mealType].averageRating.toFixed(1);
    }
    return "-1.0";
  };

  // Function to generate class for rating colors
  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4) return "bg-green-900/50 border-green-800";
    if (numRating >= 3) return "bg-yellow-900/50 border-yellow-800";
    if (numRating >= 0.001) return "bg-red-900/50 border-red-800";
    return "bg-blue-900/50 border-blue-800";
  };

  if (loading || loadingAdmin) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];
  const mealLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    eveningSnacks: "Evening Snacks",
    dinner: "Dinner",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AdminHeader />
      <div className="w-4/5 container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mess Administration</h1>
          <Link
            to={`/admin/home`}
            className="flex items-center text-blue-400 hover:text-blue-200"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Home Page</span>
          </Link>
        </div>

        {/* Mess Details Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-700">
          <div className="bg-blue-800 p-4">
            <h1 className="text-2xl font-bold">{messData.name}</h1>
            <Link
              to={`/admin/mess/complaints/${code}`}
              className="z-1 ml-[80%] px-4 py-2 bg-red-500 text-white rounded transition duration-200 hover:bg-red-600"
            >
              View Complaints
            </Link>
            <p className="text-blue-100">Mess Details & Configuration</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">General Information</h2>
              <button
                onClick={() => setEditingMess(!editingMess)}
                className={`px-4 py-2 rounded ${
                  editingMess ? "bg-red-500" : "bg-blue-500"
                } text-white transition duration-300`}
              >
                {editingMess ? "Cancel" : "Update Mess Details"}
              </button>
            </div>

            {editingMess ? (
              <form onSubmit={handleSubmit(onSubmitMess)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Mess Name</label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Location</label>
                    <input
                      {...register("location")}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Capacity</label>
                    <input
                      type="number"
                      {...register("capacity", {
                        valueAsNumber: true,
                        min: { value: 1, message: "Capacity must be positive" },
                      })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.capacity && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.capacity.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Mess Code</label>
                    <input
                      value={messData.code}
                      disabled
                      className="w-full p-2 bg-gray-600 border border-gray-600 rounded cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Hostel</label>
                    <input
                      value={messData.hostel.name}
                      disabled
                      className="w-full p-2 bg-gray-600 border border-gray-600 rounded cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Notice</label>
                  <textarea
                    {...register("notice")}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium">Workers</label>
                    <button
                      type="button"
                      onClick={addWorker}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm transition duration-200 hover:bg-green-600"
                    >
                      Add Worker
                    </button>
                  </div>

                  {messData.workers &&
                    messData.workers.map((worker, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <input
                            {...register(`workers[${index}].name`)}
                            placeholder="Worker Name"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            {...register(`workers[${index}].mobileNumber`)}
                            placeholder="Mobile Number"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-300">Mess Name:</p>
                  <p className="text-lg">{messData?.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Mess Code:</p>
                  <p className="text-lg">{messData?.code}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Hostel:</p>
                  <p className="text-lg">{messData?.hostel.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Location:</p>
                  <p className="text-lg">
                    {messData?.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Capacity:</p>
                  <p className="text-lg">{messData?.capacity}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold text-gray-300">Notice:</p>
                  <p className="text-lg">
                    {messData?.notice || "No notice available"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold text-gray-300 mb-2">Workers:</p>
                  {messData?.workers && messData.workers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {messData.workers.map((worker, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-3 rounded border border-gray-600"
                        >
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-gray-300">{worker.mobileNumber}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No workers assigned</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Food View Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              Meal Details for {selectedDay}
            </h2>
            <div className="flex items-center">
              <label htmlFor="daySelector" className="mr-2">
                View items for:
              </label>
              <select
                id="daySelector"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealTypes.map((mealType) => {
              const dayData = weeklyFoodData?.meals.find(
                (d) => d.day === selectedDay
              );
              const meal = dayData?.[mealType];
              const mealRating = getRating(selectedDay, mealType);
              const formattedMealType =
                mealType === "eveningSnacks"
                  ? "Evening Snacks"
                  : mealType.charAt(0).toUpperCase() + mealType.slice(1);

              return (
                <div
                  key={mealType}
                  className={`p-4 rounded-lg border ${getRatingColor(mealRating)}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{formattedMealType}</h3>
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 mr-1" />
                      <span>{mealRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <Clock size={14} className="text-gray-300 mr-2" />
                    <span>{formatTime(meal?.timing)}</span>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Menu:</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {meal?.items?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Food Schedule Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-700">
          <div className="bg-blue-800 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Weekly Food Schedule</h2>
              <p className="text-blue-100">Complete weekly meal timetable</p>
            </div>
            <button
              onClick={() => setEditingFood(!editingFood)}
              className={`px-4 py-2 rounded transition duration-300 ${
                editingFood ? "bg-red-500" : "bg-blue-500"
              } text-white`}
            >
              {editingFood ? "Cancel" : "Update Food Details"}
            </button>
          </div>

          {editingFood ? (
            <form
              onSubmit={handleSubmitFood(onSubmitFood)}
              className="space-y-4 p-4"
            >
              {days.map((day, dayIndex) => (
                <div key={day} className="mb-6 border-b border-gray-700 pb-4">
                  <h3 className="text-xl font-medium mb-3">{day}</h3>
                  <input
                    type="hidden"
                    {...registerFood(`meals[${dayIndex}].day`)}
                    value={day}
                  />

                  {mealTypes.map((mealType) => {
                    const mealData = weeklyFoodData?.meals.find(
                      (m) => m.day === day
                    )?.[mealType];
                    const mealRating = getRating(day, mealType);

                    return (
                      <div
                        key={`${day}-${mealType}`}
                        className={`mb-4 p-3 rounded-lg border ${getRatingColor(mealRating)}`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            {mealLabels[mealType]}
                          </h4>
                          <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            <span className="text-sm">{mealRating}</span>
                          </div>
                        </div>

                        <div className="mb-2 mt-3">
                          <label className="block text-sm mb-1">
                            Items (comma separated)
                          </label>
                          <input
                            {...registerFood(
                              `meals[${dayIndex}].${mealType}.items`
                            )}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-base"
                            placeholder="Rice, Dal, Vegetable Curry"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-sm mb-1">Hour</label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              {...registerFood(
                                `meals[${dayIndex}].${mealType}.timing.hour`,
                                {
                                  valueAsNumber: true,
                                  min: 1,
                                  max: 12,
                                }
                              )}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Minute</label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              {...registerFood(
                                `meals[${dayIndex}].${mealType}.timing.minute`,
                                {
                                  valueAsNumber: true,
                                  min: 0,
                                  max: 59,
                                }
                              )}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">AM/PM</label>
                            <select
                              {...registerFood(
                                `meals[${dayIndex}].${mealType}.timing.am_pm`
                              )}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-base"
                            >
                              <option value="am">AM</option>
                              <option value="pm">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded transition duration-200 hover:bg-green-600"
                >
                  Save Food Schedule
                </button>
              </div>
            </form>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 text-white border border-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-2 px-4 border">Day/Time</th>
                    <th className="py-2 px-4 border">Breakfast</th>
                    <th className="py-2 px-4 border">Lunch</th>
                    <th className="py-2 px-4 border">Evening Snacks</th>
                    <th className="py-2 px-4 border">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => {
                    const dayData = weeklyFoodData?.meals.find(
                      (meal) => meal.day === day
                    );
                    return (
                      <tr key={day} className="border-b border-gray-700">
                        <td className="py-2 px-4 border font-medium">{day}</td>
                        {mealTypes.map((mealType) => {
                          const mealData = dayData?.[mealType];
                          const mealRating = getRating(day, mealType);
                          return (
                            <td
                              key={`${day}-${mealType}`}
                              className="py-2 px-3 border"
                            >
                              <div
                                className={`p-2 rounded border ${getRatingColor(mealRating)}`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <Clock
                                      size={14}
                                      className="text-gray-300 mr-1"
                                    />
                                    <span className="text-sm">
                                      {formatTime(mealData?.timing)}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Star
                                      size={14}
                                      className="text-yellow-400 mr-1"
                                    />
                                    <span className="text-sm">
                                      {mealRating}
                                    </span>
                                  </div>
                                </div>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {mealData?.items?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  )) || <li>No items</li>}
                                </ul>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessDetails;
