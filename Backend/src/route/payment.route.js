import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createOrUpdatePayment,
  createPaymentOrder,
  deletePayment,
  getAllPayments,
  getPaidUsers,
  getPaymentByHostel,
  getStudentPaymentDetails,
  togglePaymentStatus,
  verifyPayment,
} from "../controller/payment.controller.js";

const router = express.Router();

// Admin routes
router.post("/create", verifyJWT, createOrUpdatePayment);
router.get("/all", verifyJWT, getAllPayments);
router.get("/hostel/:hostelId", verifyJWT, getPaymentByHostel);
router.patch("/toggle/:paymentId", verifyJWT, togglePaymentStatus);
router.get("/paid-users/:paymentId", verifyJWT, getPaidUsers);
router.delete("/delete/:paymentId", verifyJWT, deletePayment);

// Student routes
router.post("/student/details", verifyJWT, getStudentPaymentDetails);
router.post("/create-order", verifyJWT, createPaymentOrder);
router.post("/verify", verifyJWT, verifyPayment);

export default router;
