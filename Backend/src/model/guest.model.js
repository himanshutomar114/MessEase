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
      enum: ["pending", "approved", "occupied", "available", "reserved", "rejected", "cancelled"],
      default: "pending",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
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
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
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
