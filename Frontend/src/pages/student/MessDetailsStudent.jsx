import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  Calendar,
  Info,
  Users,
  MapPin,
  ChevronRight,
  Utensils,
  AlertCircle,
} from "lucide-react";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const MessDetailsStudent = () => {
  const { messCode } = useParams();
  const [messData, setMessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();
  const isBlocked = useSelector((state) => state.auth.isBlocked);
  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/mess/student/${messCode}`);
        if (response.data?.messExists === false) {
          setError("Mess doesn't exist");
          toast.error("Mess doesn't exist");
        } else {
          setMessData(response.data.data);
          // Set initial user rating if available
          if (response.data.data.currentMealInfo.userRating) {
            setUserRating(response.data.data.currentMealInfo.userRating);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch mess details");
        toast.error(
          err.response?.data?.message || "Failed to fetch mess details"
        );
      } finally {
        setLoading(false); // Ensure loading stops in all cases
      }
    };

    fetchMessDetails();
  }, [messCode]);

  const handleRatingSubmit = async (rating) => {
    try {
      // Set rating immediately for better UX
      setUserRating(rating);

      await api.post("/api/mess/rate", {
        messCode,
        day: messData?.currentMealInfo.day,
        mealType: messData?.currentMealInfo.mealType,
        rating: rating,
      });

      // Refresh data after rating
      const response = await api.get(`/api/mess/student/${messCode}`);
      setMessData(response.data.data);

      toast.success("Rating submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
      // Reset to previous rating on error
      setUserRating(messData?.currentMealInfo.userRating || 0);
    }
  };

  const formatTime = (timing) => {
    if (!timing) return "N/A";
    return `${timing.hour}:${timing.minute.toString().padStart(2, "0")} ${timing.am_pm}`;
  };

  // Get appropriate meal background based on time of day
  const getMealBackground = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "from-blue-900 to-indigo-900";
      case "lunch":
        return "from-indigo-900 to-purple-900";
      case "eveningSnacks":
        return "from-purple-900 to-pink-900";
      case "dinner":
        return "from-pink-900 to-red-900";
      default:
        return "from-gray-800 to-gray-900";
    }
  };

  // Format meal type for display
  const formatMealType = (mealType) => {
    if (mealType === "eveningSnacks") return "Evening Snacks";
    return mealType?.charAt(0).toUpperCase() + mealType?.slice(1);
  };

  if (loading || (!messData && !error) || loadingCheck) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="w-4/5 mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative w-full bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl overflow-hidden mb-6 md:mb-8">
          <div className="absolute inset-0 bg-black/20"></div>

          <div className="relative p-5 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {messData?.mess.name}
              </h1>

              <Link
                className="mt-3 sm:mt-0 self-start sm:self-auto bg-red-700 px-3 py-1.5 text-sm md:text-base rounded-lg hover:bg-red-800 transition duration-200 flex items-center justify-center"
                to={`/student/mess/${messCode}/complaints`}
              >
                <AlertCircle size={16} className="mr-1 hidden sm:inline" />
                Complaints
              </Link>
            </div>

            <div className="flex items-center text-blue-200 mb-5">
              <MapPin size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                {messData?.mess.location || "Location not specified"}
              </span>
            </div>

            <div className="mt-4 md:mt-6 flex">
              <Link
                to={`/student/mess/${messCode}/time-table`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg font-medium transition-all group text-center"
              >
                <Calendar size={16} className="mr-2 hidden sm:inline" />
                View Weekly Schedule
                <ChevronRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Notice Banner (if exists) */}
        {messData?.mess.notice && (
          <div className="bg-gradient-to-r from-amber-900/70 to-yellow-900/70 p-4 rounded-lg border border-amber-700/50 mb-6">
            <div className="flex items-start">
              <Info
                size={22}
                className="text-amber-300 mr-3 mt-1 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-amber-200 text-lg">Notice</h3>
                <p className="text-amber-100/90">{messData?.mess.notice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Meal Card */}
          <div
            className={`rounded-lg overflow-hidden shadow-lg border border-indigo-800/30`}
          >
            <div
              className={`bg-gradient-to-r ${getMealBackground(messData?.currentMealInfo.mealType)} p-4`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold py-1 px-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    CURRENT MEAL
                  </span>
                  <h2 className="text-2xl font-bold mt-2">
                    {formatMealType(messData?.currentMealInfo.mealType)}
                  </h2>
                </div>
                <div className="flex items-center bg-black/20 rounded-full p-2">
                  <Star
                    size={16}
                    className="text-yellow-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="font-semibold">
                    {messData?.currentMealInfo.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="text-indigo-300 mr-2" />
                  <span>{messData?.currentMealInfo.day}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-indigo-300 mr-2" />
                  <span>{formatTime(messData?.currentMealInfo.timing)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">MENU</h3>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <ul className="space-y-1">
                    {messData?.currentMealInfo.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Utensils
                          size={14}
                          className="mr-2 mt-1 text-indigo-400"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  RATE THIS MEAL
                </h3>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onClick={() => handleRatingSubmit(star)}
                    >
                      <Star
                        size={24}
                        className={`cursor-pointer mr-2 transition-colors ${
                          star <= userRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600 hover:text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">
                    {userRating > 0
                      ? `Your rating: ${userRating}/5`
                      : "Not rated yet"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Meal Card */}
          <div className="rounded-lg overflow-hidden shadow-lg border border-gray-800/50">
            <div
              className={`bg-gradient-to-r ${getMealBackground(messData?.nextMealInfo.mealType)} p-4`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold py-1 px-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    NEXT MEAL
                  </span>
                  <h2 className="text-2xl font-bold mt-2">
                    {formatMealType(messData?.nextMealInfo.mealType)}
                  </h2>
                </div>
                <div className="flex items-center bg-black/20 rounded-full p-2">
                  <Star
                    size={16}
                    className="text-yellow-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="font-semibold">
                    {messData?.nextMealInfo.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="text-indigo-300 mr-2" />
                  <span>{messData?.nextMealInfo.day}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-indigo-300 mr-2" />
                  <span>{formatTime(messData?.nextMealInfo.timing)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">MENU</h3>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <ul className="space-y-1">
                    {messData?.nextMealInfo.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Utensils
                          size={14}
                          className="mr-2 mt-1 text-indigo-400"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center">
                  <Clock size={16} className="text-gray-300 mr-2" />
                  <span className="text-gray-300">Coming up next</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mess Information Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">
            Mess Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-900/50">
              <div className="flex items-center mb-3">
                <div className="bg-blue-900/40 rounded-full p-3">
                  <Users size={22} className="text-blue-300" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Capacity</h3>
                  <p className="text-blue-300 font-semibold">
                    {messData?.mess.capacity} students
                  </p>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                This mess can accommodate up to {messData?.mess.capacity}{" "}
                students at once.
              </p>
            </div>

            {messData?.mess.workers && messData?.mess.workers.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-900/50">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Users size={18} className="text-purple-300 mr-2" />
                  Mess Staff
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {messData?.mess.workers.map((worker, index) => (
                    <div key={index} className="bg-gray-900/60 p-3 rounded-lg">
                      <p className="font-medium">{worker.name}</p>
                      {worker.mobileNumber && (
                        <p className="text-sm text-gray-400">
                          Contact: {worker.mobileNumber}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDetailsStudent;
