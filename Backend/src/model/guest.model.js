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
      enum: ["pending", "approved", "occupied", "available", "reserved", "rejected"],
      default: "pending",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    purpose: {
      type: String,
    },
  },
  { timestamps: true }
);

const GuestRoom = mongoose.model("GuestRoom", GuestRoomSchema);
export default GuestRoom;
