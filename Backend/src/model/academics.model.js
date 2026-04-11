import mongoose, { Schema } from "mongoose";

const academicsSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cgpa: {
      type: Number,
      default: 3.8,
      min: 0,
      max: 10,
    },
    timetable: {
      type: Schema.Types.Mixed,
      default: {},
    },
    semester: {
      type: Number,
      default: 1,
    },
    academicYear: {
      type: String,
      default: new Date().getFullYear().toString(),
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
academicsSchema.index({ student: 1, semester: 1, academicYear: 1 });

const Academics = mongoose.model("Academics", academicsSchema);

export default Academics;
