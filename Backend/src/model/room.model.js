import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  occupants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;
