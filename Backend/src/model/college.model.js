import mongoose, { Schema } from "mongoose";

const collegeSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["verified", "unverified"],
      default: "unverified",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
    },
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    contactEmail: String,
    contactPhone: String,
    website: String,
    hostel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model("College", collegeSchema);

export default College;
