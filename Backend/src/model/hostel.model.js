import mongoose, { Schema } from "mongoose";

// Existing Hostel Schema with modifications
const HostelSchema = new Schema(
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
    location: {
      type: String,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
    },
    roomCapacity: {
      type: Number,
      required: true,
    },
    // Add guest rooms field to the hostel schema
    guestRooms: {
      count: {
        type: Number,
        default: 0,
        required: true,
      },
      roomNumbers: [
        {
          type: String,
        },
      ],
    },

    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mess: {
      type: Schema.Types.ObjectId,
      ref: "Mess",
    },
    workers: [
      {
        name: {
          type: String,
        },
        work: {
          type: String,
          enum: [
            "roomCleaner",
            "hostelCleaner",
            "gardenCleaner",
            "electrician",
            "accountant",
            "warden",
          ],
        },
        mobileNumber: {
          type: String,
        },
      },
    ],
    chatCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Hostel = mongoose.model("Hostel", HostelSchema);

export default Hostel;
