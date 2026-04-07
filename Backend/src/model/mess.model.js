import mongoose, { Schema } from "mongoose";

const MessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    location: {
      type: String,
      default: null,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    notice: {
      type: String,
      default: null,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    workers: [
      {
        name: {
          type: String,
        },
        mobileNumber: {
          type: String,
        },
      },
    ],
    foodRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WeeklyFood",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Mess = mongoose.model("Mess", MessSchema);

export default Mess;
