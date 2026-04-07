import Mess from "../model/mess.model.js";
import Hostel from "../model/hostel.model.js";
import WeeklyFood from "../model/food.model.js";
import mongoose from "mongoose";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const createMess = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      hostel: hostelId,
      location,
      capacity,
      workers,
      meals,
    } = req.body;
    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId).session(session);
    if (!hostel) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Create new mess
    const newMess = new Mess({
      name,
      hostel: hostelId,
      location,
      capacity: capacity || 100,
      workers,
      admins: req.user?._id ? [req.user._id] : [],
      code: hostel.code,
      college: req.user.college,
    });

    const savedMess = await newMess.save({ session });
    // Create weekly food record
    const weeklyFood = new WeeklyFood({
      mess: savedMess._id,
      meals: meals.map((meal) => ({
        day: meal.day,
        breakfast: {
          items: meal.breakfast
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),
          timing: req.body.mealTimings.breakfast,
        },
        lunch: {
          items: meal.lunch
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),
          timing: req.body.mealTimings.lunch,
        },
        eveningSnacks: {
          items: meal.eveningSnacks
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),
          timing: req.body.mealTimings.eveningSnacks,
        },
        dinner: {
          items: meal.dinner
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),
          timing: req.body.mealTimings.dinner,
        },
      })),
    });

    const savedWeeklyFood = await weeklyFood.save({ session });

    // Update mess with food record reference
    savedMess.foodRecords = [savedWeeklyFood._id];
    await savedMess.save({ session });

    // Update hostel with mess reference
    hostel.mess = savedMess._id;
    await hostel.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Mess created successfully",
      mess: savedMess,
      weeklyFood: savedWeeklyFood,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating mess:", error);
    res.status(500).json({
      message: "Failed to create mess",
      error: error.message,
    });
  }
};

export const fetchMessDetails = asyncHandler(async (req, res) => {
  const { code } = req.params;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code })
    .populate("hostel", "name")
    .populate("admins", "name email");

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Fetch weekly food data for the mess
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { mess, weeklyFood },
        "Mess details fetched successfully"
      )
    );
});

export const updateMessDetails = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { name, location, capacity, notice, workers } = req.body;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code });

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Update fields if provided
  if (name) mess.name = name;
  if (location) mess.location = location;
  if (capacity) mess.capacity = capacity;
  if (notice) mess.notice = notice;
  if (workers) mess.workers = workers;

  // Save updated mess
  await mess.save();

  return res
    .status(200)
    .json(new ApiResponse(200, mess, "Mess details updated successfully"));
});

export const updateWeeklyFood = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { meals } = req.body;

  if (!code) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find mess by code
  const mess = await Mess.findOne({ code });

  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Find weekly food for the mess
  let weeklyFood = await WeeklyFood.findOne({ mess: mess._id });

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Update meals if provided
  if (meals && Array.isArray(meals)) {
    // Create a map of existing meals by day for quick lookup
    const existingMealsMap = {};
    weeklyFood.meals.forEach((meal) => {
      existingMealsMap[meal.day] = meal;
    });

    // Process each meal from request body
    const updatedMeals = meals.map((newMeal) => {
      const existingMeal = existingMealsMap[newMeal.day];

      // If meal for this day exists, merge only the meal content (items, timing)
      // but preserve existing ratings
      if (existingMeal) {
        const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];

        mealTypes.forEach((type) => {
          if (newMeal[type]) {
            // If the meal type exists in request, update items and timing
            if (existingMeal[type]) {
              // Preserve ratings and just update items and timing
              newMeal[type] = {
                ...newMeal[type],
                ratings: existingMeal[type].ratings || [],
                averageRating: existingMeal[type].averageRating || 0,
                ratingCount: existingMeal[type].ratingCount || 0,
              };
            } else {
              // If this meal type is new, initialize ratings array
              newMeal[type].ratings = [];
              newMeal[type].averageRating = 0;
              newMeal[type].ratingCount = 0;
            }
          } else if (existingMeal[type]) {
            // If meal type not in request but exists in DB, keep it
            newMeal[type] = existingMeal[type];
          }
        });

        return newMeal;
      }

      // If it's a completely new meal for a day, initialize ratings for each meal type
      const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];
      mealTypes.forEach((type) => {
        if (newMeal[type]) {
          newMeal[type].ratings = [];
          newMeal[type].averageRating = 0;
          newMeal[type].ratingCount = 0;
        }
      });

      return newMeal;
    });

    weeklyFood.meals = updatedMeals;
  }

  // Save updated weekly food
  await weeklyFood.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        weeklyFood,
        "Weekly food details updated successfully"
      )
    );
});

export const getAllMessesInCollege = asyncHandler(async (req, res) => {
  try {
    // Get the college ID from the authenticated user
    const collegeId = req.user.college;
    // console.log("first", req.user);

    if (!collegeId) {
      throw new ApiError(400, "College ID not found in user data");
    }

    // Find all messes with the matching college ID
    const messes = await Mess.find({ college: collegeId })
      .populate("hostel", "name code") // Populate hostel with name and code fields
      .select("-foodRecords"); // Exclude the foodRecords array for better performance

    if (!messes || messes.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No messes found for this college"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, messes, "Messes fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching messes");
  }
});

// Helper function to get current day and meal timing
export const getCurrentMealInfo = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDate = new Date();
  const currentDay = days[currentDate.getDay()];

  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  // Define meal time boundaries (24-hour format)
  const breakfastEnd = 10; // 10:00 AM
  const lunchEnd = 15; // 3:00 PM
  const snacksEnd = 18; // 6:00 PM

  let currentMeal;
  if (currentHour < breakfastEnd) {
    currentMeal = "breakfast";
  } else if (currentHour < lunchEnd) {
    currentMeal = "lunch";
  } else if (currentHour < snacksEnd) {
    currentMeal = "eveningSnacks";
  } else {
    currentMeal = "dinner";
  }

  // Determine next meal
  let nextMeal;
  if (currentMeal === "breakfast") {
    nextMeal = "lunch";
  } else if (currentMeal === "lunch") {
    nextMeal = "eveningSnacks";
  } else if (currentMeal === "eveningSnacks") {
    nextMeal = "dinner";
  } else {
    nextMeal = "breakfast"; // Next day's breakfast
  }

  return { currentDay, currentMeal, nextMeal };
};

// Rate a meal or update existing rating
export const rateMeal = asyncHandler(async (req, res) => {
  const { messCode, day, mealType, rating } = req.body;

  if (!messCode || !day || !mealType || !rating) {
    throw new ApiError(400, "Missing required fields");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Get the userId from the authenticated user
  const userId = req.user._id;

  // First, find the mess by its code
  const mess = await Mess.findOne({ code: messCode }).select("_id");
  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Now, find the weekly food record using the mess id
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id }).populate(
    "mess"
  );

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Find the meal for the specified day
  const mealIndex = weeklyFood.meals.findIndex((meal) => meal.day === day);

  if (mealIndex === -1) {
    throw new ApiError(404, `Meal schedule for ${day} not found`);
  }

  // Check if the meal type exists
  if (!weeklyFood.meals[mealIndex][mealType]) {
    throw new ApiError(404, `${mealType} is not a valid meal type`);
  }

  // Check if user has already rated this meal
  const ratingIndex = weeklyFood.meals[mealIndex][mealType].ratings.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  // Create the rating object with only user and rating fields
  const ratingObject = {
    user: userId,
    rating: Number(rating),
  };

  // Update or add the rating
  if (ratingIndex !== -1) {
    // Update existing rating by replacing the rating value
    weeklyFood.meals[mealIndex][mealType].ratings[ratingIndex].rating =
      Number(rating);
  } else {
    weeklyFood.meals[mealIndex][mealType].ratings.push(ratingObject);
  }

  await weeklyFood.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        day,
        mealType,
        rating,
        averageRating: weeklyFood.meals[mealIndex][mealType].averageRating,
        ratingCount: weeklyFood.meals[mealIndex][mealType].ratingCount,
      },
      ratingIndex !== -1
        ? "Rating updated successfully"
        : "Meal rated successfully"
    )
  );
});

// Get a student's meal ratings for a specific mess
export const getStudentMealRatings = asyncHandler(async (req, res) => {
  const { messCode } = req.params;
  const userId = req.user._id;

  if (!messCode) {
    throw new ApiError(400, "Mess code is required");
  }

  // First, find the mess by its code
  const mess = await Mess.findOne({ code: messCode }).select("_id");
  if (!mess) {
    throw new ApiError(404, "Mess not found");
  }

  // Now, find the weekly food record using the mess id
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id }).populate(
    "mess"
  );

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Extract user's ratings for each meal
  const userRatings = {};

  weeklyFood.meals.forEach((meal) => {
    userRatings[meal.day] = {
      breakfast: meal.breakfast.ratings.find(
        (r) => r.user.toString() === userId.toString()
      ),
      lunch: meal.lunch.ratings.find(
        (r) => r.user.toString() === userId.toString()
      ),
      eveningSnacks: meal.eveningSnacks.ratings.find(
        (r) => r.user.toString() === userId.toString()
      ),
      dinner: meal.dinner.ratings.find(
        (r) => r.user.toString() === userId.toString()
      ),
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { userRatings }, "User ratings fetched successfully")
    );
});

// Get mess details for student with current meal information
export const getMessDetailsForStudent = asyncHandler(async (req, res) => {
  const { messCode } = req.params;
  const userId = req.user._id;

  if (!messCode) {
    throw new ApiError(400, "Mess code is required");
  }

  // Find the mess
  const mess = await Mess.findOne({ code: messCode })
    .populate("hostel", "name")
    .select("name location capacity notice workers");

  if (!mess) {
    return res.status(250).json({
      message: "Mess not found",
      messExists: false,
    });
  }

  // Find the weekly food record for the mess
  const weeklyFood = await WeeklyFood.findOne({ mess: mess._id });

  if (!weeklyFood) {
    throw new ApiError(404, "Weekly food schedule not found for this mess");
  }

  // Get current day and meal info
  const { currentDay, currentMeal, nextMeal } = getCurrentMealInfo();

  // Find the meal for the current day
  const todayMeal = weeklyFood.meals.find((meal) => meal.day === currentDay);

  if (!todayMeal) {
    throw new ApiError(404, `Meal schedule for ${currentDay} not found`);
  }

  // Find user's rating for current meal if exists
  const userCurrentMealRating = todayMeal[currentMeal].ratings.find(
    (r) => r.user.toString() === userId.toString()
  );

  // Define days array for calculating next day
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get next day if next meal is breakfast (i.e. next day’s breakfast)
  let nextDayIndex = days.indexOf(currentDay);
  let nextDay = currentDay;

  if (nextMeal === "breakfast") {
    nextDayIndex = (nextDayIndex + 1) % 7;
    nextDay = days[nextDayIndex];
  }

  // Find next meal data
  const nextDayMeal = weeklyFood.meals.find((meal) => meal.day === nextDay);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        mess,
        currentMealInfo: {
          day: currentDay,
          mealType: currentMeal,
          items: todayMeal[currentMeal].items,
          timing: todayMeal[currentMeal].timing,
          averageRating: todayMeal[currentMeal].averageRating,
          userRating: userCurrentMealRating
            ? userCurrentMealRating.rating
            : null,
        },
        nextMealInfo: {
          day: nextDay,
          mealType: nextMeal,
          items: nextDayMeal[nextMeal].items,
          timing: nextDayMeal[nextMeal].timing,
          averageRating: nextDayMeal[nextMeal].averageRating,
        },
        weeklySchedule: weeklyFood.meals,
      },
      "Mess details fetched successfully for student"
    )
  );
});
