import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Clock } from "lucide-react";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const MessTimeTable = () => {
  const { messCode } = useParams();
  const [weeklyData, setWeeklyData] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday"); // Default to Monday for item viewing
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
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch mess details with weekly schedule
        const messResponse = await api.get(`/api/mess/student/${messCode}`);
        console.log(messResponse);
        if (messResponse.data?.messExists === false) {
          toast.error("Mess not found");
          setError("Mess not found");
        } else {
          setWeeklyData(messResponse.data.data);
          // Fetch user's ratings
          const ratingsResponse = await api.get(
            `/api/mess/ratings/${messCode}`
          );
          setUserRatings(ratingsResponse.data.data.userRatings);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
        toast.error(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [messCode]);

  const handleRatingSubmit = async (day, mealType, rating) => {
    try {
      await api.post("/api/mess/rate", {
        messCode,
        day,
        mealType,
        rating,
      });

      // Refresh data after rating
      const messResponse = await api.get(`/api/mess/student/${messCode}`);
      setWeeklyData(messResponse.data.data);

      const ratingsResponse = await api.get(`/api/mess/ratings/${messCode}`);
      setUserRatings(ratingsResponse.data.data.userRatings);

      toast.success("Rating submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const formatTime = (timing) => {
    if (!timing) return "N/A";
    return `${timing.hour}:${timing.minute.toString().padStart(2, "0")} ${timing.am_pm}`;
  };

  const getUserRatingColor = (day, mealType) => {
    const rating = userRatings[day]?.[mealType]?.rating;
    if (!rating) return "bg-gray-800 border-gray-700";

    if (rating >= 4) return "bg-green-900 border-green-800";
    if (rating >= 3) return "bg-yellow-900 border-yellow-800";
    return "bg-red-900 border-red-800";
  };

  // Function to display meal items in a more compact format
  const renderMealItems = (items) => {
    if (!items || items.length === 0) return "No items available";

    // Group items in pairs
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      const item1 = items[i];
      const item2 = i + 1 < items.length ? items[i + 1] : null;

      if (item2) {
        rows.push(`${item1}, ${item2}`);
      } else {
        rows.push(item1);
      }
    }

    // If there are too many rows, show only first few with slider
    if (rows.length > 3) {
      return (
        <div className="relative">
          <div className="max-h-20 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
            <ul className="list-disc pl-4 text-sm space-y-1">
              {rows.map((row, idx) => (
                <li key={idx}>{row}</li>
              ))}
            </ul>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none"></div>
        </div>
      );
    }

    return (
      <ul className="list-disc pl-4 text-sm space-y-1">
        {rows.map((row, idx) => (
          <li key={idx}>{row}</li>
        ))}
      </ul>
    );
  };

  // Star rating component
  const StarRating = ({ day, mealType, currentRating = 0 }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`cursor-pointer ${
              star <= currentRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-500"
            }`}
            onClick={() => handleRatingSubmit(day, mealType, star)}
          />
        ))}
      </div>
    );
  };

  if (loading || ((!weeklyData || !userRatings) && !error) || loadingCheck) {
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
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />

      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 px-4">
          <Link
            to={`/student/mess/${messCode}`}
            className="flex items-center text-blue-400 hover:text-blue-200"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to Mess Details</span>
          </Link>

          <div className="flex items-center">
            <label htmlFor="daySelector" className="mr-2">
              View items for:
            </label>
            <select
              id="daySelector"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            >
              {weeklyData?.weeklySchedule.map((day) => (
                <option key={day.day} value={day.day}>
                  {day.day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Full Menu for {selectedDay}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyData?.weeklySchedule ? (
              ["breakfast", "lunch", "eveningSnacks", "dinner"].map(
                (mealType) => {
                  const dayData = weeklyData.weeklySchedule.find(
                    (d) => d.day === selectedDay
                  );
                  if (!dayData)
                    return (
                      <div
                        key={mealType}
                        className="p-4 rounded-lg bg-gray-700 text-white"
                      >
                        No schedule available for {selectedDay}
                      </div>
                    );
                  const meal = dayData[mealType];
                  const formattedMealType =
                    mealType === "eveningSnacks"
                      ? "Evening Snacks"
                      : mealType.charAt(0).toUpperCase() + mealType.slice(1);
                  return (
                    <div
                      key={mealType}
                      className={`p-4 rounded-lg ${getUserRatingColor(selectedDay, mealType)}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">{formattedMealType}</h3>
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 mr-1" />
                          <span>{meal.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center mb-3">
                        <Clock size={14} className="text-gray-300 mr-2" />
                        <span>{formatTime(meal.timing)}</span>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Menu:</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {meal.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Your Rating:
                        </h4>
                        <StarRating
                          day={selectedDay}
                          mealType={mealType}
                          currentRating={
                            userRatings[selectedDay]?.[mealType]?.rating || 0
                          }
                        />
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="p-4 text-center text-white">
                No weekly schedule data available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-700">
          <div className="bg-blue-800 p-4">
            <h1 className="text-2xl font-bold">{weeklyData?.mess.name}</h1>
            <p className="text-blue-100">Weekly Meal Schedule</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="border border-gray-600 p-2 text-left">Day</th>
                  <th className="border border-gray-600 p-2">Breakfast</th>
                  <th className="border border-gray-600 p-2">Lunch</th>
                  <th className="border border-gray-600 p-2">Evening Snacks</th>
                  <th className="border border-gray-600 p-2">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData?.weeklySchedule.map((day) => (
                  <tr key={day.day} className="border-t border-gray-700">
                    <td className="border border-gray-600 p-2 font-medium">
                      {day.day}
                    </td>

                    {/* Breakfast Cell */}
                    <td className="border border-gray-600 p-2">
                      <div
                        className={`p-2 rounded border ${getUserRatingColor(day.day, "breakfast")}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-300 mr-1" />
                            <span className="text-sm">
                              {formatTime(day.breakfast.timing)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {day.breakfast.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {renderMealItems(day.breakfast.items)}

                        <div className="mt-2 flex justify-center">
                          <StarRating
                            day={day.day}
                            mealType="breakfast"
                            currentRating={
                              userRatings[day.day]?.breakfast?.rating || 0
                            }
                          />
                        </div>
                      </div>
                    </td>

                    {/* Lunch Cell */}
                    <td className="border border-gray-600 p-2">
                      <div
                        className={`p-2 rounded border ${getUserRatingColor(day.day, "lunch")}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-300 mr-1" />
                            <span className="text-sm">
                              {formatTime(day.lunch.timing)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {day.lunch.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {renderMealItems(day.lunch.items)}

                        <div className="mt-2 flex justify-center">
                          <StarRating
                            day={day.day}
                            mealType="lunch"
                            currentRating={
                              userRatings[day.day]?.lunch?.rating || 0
                            }
                          />
                        </div>
                      </div>
                    </td>

                    {/* Evening Snacks Cell */}
                    <td className="border border-gray-600 p-2">
                      <div
                        className={`p-2 rounded border ${getUserRatingColor(day.day, "eveningSnacks")}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-300 mr-1" />
                            <span className="text-sm">
                              {formatTime(day.eveningSnacks.timing)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {day.eveningSnacks.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {renderMealItems(day.eveningSnacks.items)}

                        <div className="mt-2 flex justify-center">
                          <StarRating
                            day={day.day}
                            mealType="eveningSnacks"
                            currentRating={
                              userRatings[day.day]?.eveningSnacks?.rating || 0
                            }
                          />
                        </div>
                      </div>
                    </td>

                    {/* Dinner Cell */}
                    <td className="border border-gray-600 p-2">
                      <div
                        className={`p-2 rounded border ${getUserRatingColor(day.day, "dinner")}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-300 mr-1" />
                            <span className="text-sm">
                              {formatTime(day.dinner.timing)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {day.dinner.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {renderMealItems(day.dinner.items)}

                        <div className="mt-2 flex justify-center">
                          <StarRating
                            day={day.day}
                            mealType="dinner"
                            currentRating={
                              userRatings[day.day]?.dinner?.rating || 0
                            }
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessTimeTable;
