import Payment from "../model/payment.model.js";
import Hostel from "../model/hostel.model.js";
import User from "../model/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Create or update a payment for a hostel
export const createOrUpdatePayment = async (req, res) => {
  try {
    const { hostelId, amount, title, description, dueDate, isActive } =
      req.body;

    if (!hostelId || !amount || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }

    let payment = await Payment.findOne({ hostelId });

    if (payment) {
      payment.amount = amount;
      payment.title = title;
      payment.description = description || payment.description;
      payment.dueDate = dueDate || payment.dueDate;
      payment.isActive = isActive !== undefined ? isActive : payment.isActive;
      payment.updatedAt = Date.now();
    } else {
      payment = new Payment({
        hostelId,
        amount,
        title,
        description,
        dueDate,
        isActive: isActive !== undefined ? isActive : true,
      });
    }

    await payment.save();
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("Error in createOrUpdatePayment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get all payments (for admin)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("hostelId", "name");
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get payment by hostel ID
export const getPaymentByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const payment = await Payment.findOne({ hostelId });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "No payment found for this hostel" });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("Error in getPaymentByHostel:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Toggle payment status (enable/disable)
export const togglePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    payment.isActive = !payment.isActive;
    payment.updatedAt = Date.now();
    await payment.save();

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("Error in togglePaymentStatus:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get payment details for a student
export const getStudentPaymentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.hostel) {
      return res
        .status(400)
        .json({ success: false, message: "User not assigned to any hostel" });
    }

    const payment = await Payment.findOne({ hostelId: user.hostel });

    if (!payment || !payment.isActive) {
      return res.status(200).json({
        success: true,
        data: {
          paymentExists: false,
          message: "No payment enabled for your hostel/mess",
        },
      });
    }

    const hasPaid = payment.paidUsers.some(
      (paid) => paid.userId.toString() === userId
    );
    const paymentDetails = payment.paidUsers.find(
      (paid) => paid.userId.toString() === userId
    );

    return res.status(200).json({
      success: true,
      data: {
        paymentExists: true,
        payment: {
          id: payment._id,
          amount: payment.amount,
          title: payment.title,
          description: payment.description,
          dueDate: payment.dueDate,
        },
        hasPaid,
        paymentDetails,
      },
    });
  } catch (error) {
    console.error("Error in getStudentPaymentDetails:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Create Razorpay order for payment
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found or inactive" });
    }

    const hasPaid = payment.paidUsers.some(
      (paid) => paid.userId.toString() === userId
    );
    if (hasPaid) {
      return res
        .status(400)
        .json({ success: false, message: "You have already paid this fee" });
    }

    const receipt = `r_${userId.toString().slice(0, 4)}_${payment._id.toString().slice(0, 4)}_${Date.now()}`;

    const options = {
      amount: payment.amount * 100,
      currency: "INR",
      receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: payment.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_API_KEY,
      },
    });
  } catch (error) {
    console.error("Error in createPaymentOrder:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Verify and record payment
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found or inactive" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    payment.paidUsers.push({
      userId,
      transactionId: razorpayOrderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      paymentMethod: "razorpay",
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      data: { paymentId: razorpayPaymentId },
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get list of users who paid for a specific payment
export const getPaidUsers = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate(
      "paidUsers.userId",
      "name email rollNumber"
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({ success: true, data: payment.paidUsers });
  } catch (error) {
    console.error("Error in getPaidUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error in deletePayment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
