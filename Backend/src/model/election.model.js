import mongoose, { Schema } from "mongoose";

// Schema for manager applications
const ApplicationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    position: {
      type: String,
      enum: ["messManager", "hostelManager"],
      required: true,
    },
    targetId: {
      // ID of the mess or hostel being applied for
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "position" === "messManager" ? "Mess" : "Hostel",
    },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for election/voting configuration
const ElectionConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["messManager", "hostelManager"],
      required: true,
    },
    targetId: {
      // ID of the mess or hostel
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "type" === "messManager" ? "Mess" : "Hostel",
    },
    applicationPhase: {
      isOpen: {
        type: Boolean,
        default: false,
      },
      openedAt: Date,
      closedAt: Date,
      questions: [String], // Questions to be asked during application
    },
    votingPhase: {
      isOpen: {
        type: Boolean,
        default: false,
      },
      openedAt: Date,
      closedAt: Date,
      candidates: [
        {
          applicationId: {
            type: Schema.Types.ObjectId,
            ref: "Application",
          },
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },
    result: {
      winnerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      announcedAt: Date,
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for votes
const VoteSchema = new Schema(
  {
    election: {
      type: Schema.Types.ObjectId,
      ref: "ElectionConfig",
      required: true,
    },
    voter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create models
const Application = mongoose.model("Application", ApplicationSchema);
const ElectionConfig = mongoose.model("ElectionConfig", ElectionConfigSchema);
const Vote = mongoose.model("Vote", VoteSchema);

export { Application, ElectionConfig, Vote };
