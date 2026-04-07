import mongoose, { Schema } from "mongoose";

const ComplaintStatus = {
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const ComplaintCategories = {
  FOOD_QUALITY: "Food Quality",
  SERVICE: "Service",
  MENU: "Menu Concerns",
  HOSTEL: "Hostel",
};

const complaintSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.PENDING,
    },
    Hostelcode: {
      type: String,
      required: true,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        url: {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              // Basic URL validation
              return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
                v
              );
            },
            message: (props) => `${props.value} is not a valid URL!`,
          },
        },
      },
    ],
    category: {
      type: String,
      enum: Object.values(ComplaintCategories),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
