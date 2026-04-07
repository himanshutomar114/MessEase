import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupName: { type: String, required: true },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      unique: true,
    },
    chats: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
          default: "",
        },
        image: {
          type: String, // Base64 encoded image
          default: null,
        },
        audio: {
          type: String, // Base64 encoded image
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        pinned: {
          type: Boolean,
          default: false,
        },
      },
    ], // Array of chat objects
  },
  { timestamps: true }
);

const GroupChat = mongoose.model("GroupChat", GroupChatSchema);
export default GroupChat;
