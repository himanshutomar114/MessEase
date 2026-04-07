// models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  paidUsers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
      transactionId: {
        type: String,
      },
      paymentMethod: {
        type: String,
      },
      razorpayPaymentId: {
        type: String,
      },
      razorpayOrderId: {
        type: String,
      },
      razorpaySignature: {
        type: String,
      },
    },
  ],
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
