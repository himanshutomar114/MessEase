import mongoose, { Schema } from "mongoose";

const GuestRoomSchema = new Schema(
  {
    hostel: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["occupied", "available", "reserved"],
      default: "reserved",
    },
    purpose: {
      type: String,
    },
  },
  { timestamps: true }
);

const GuestRoom = mongoose.model("GuestRoom", GuestRoomSchema);
export default GuestRoom;
