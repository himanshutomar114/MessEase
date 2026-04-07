import mongoose from "mongoose";

const WeeklyFoodSchema = new mongoose.Schema(
  {
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    meals: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        breakfast: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
          ratings: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
              },
            },
          ],
          averageRating: {
            type: Number,
            default: 0,
          },
          ratingCount: {
            type: Number,
            default: 0,
          },
        },
        lunch: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
          ratings: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
              },
            },
          ],
          averageRating: {
            type: Number,
            default: 0,
          },
          ratingCount: {
            type: Number,
            default: 0,
          },
        },
        eveningSnacks: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
          ratings: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
              },
            },
          ],
          averageRating: {
            type: Number,
            default: 0,
          },
          ratingCount: {
            type: Number,
            default: 0,
          },
        },
        dinner: {
          items: [{ type: String, required: true }],
          timing: {
            hour: {
              type: Number,
              max: 12,
              min: 1,
            },
            minute: {
              type: Number,
              max: 59,
              min: 0,
            },
            am_pm: {
              type: String,
              enum: ["am", "pm"],
            },
          },
          ratings: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true,
              },
            },
          ],
          averageRating: {
            type: Number,
            default: 0,
          },
          ratingCount: {
            type: Number,
            default: 0,
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate averageRating and update ratingCount for each meal type
WeeklyFoodSchema.pre("save", function (next) {
  const calculateAverage = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  };

  this.meals.forEach((meal) => {
    const mealTypes = ["breakfast", "lunch", "eveningSnacks", "dinner"];

    mealTypes.forEach((type) => {
      if (meal[type] && meal[type].ratings) {
        meal[type].averageRating = calculateAverage(meal[type].ratings);
        meal[type].ratingCount = meal[type].ratings.length;
      }
    });
  });

  next();
});

const WeeklyFood = mongoose.model("WeeklyFood", WeeklyFoodSchema);

export default WeeklyFood;
