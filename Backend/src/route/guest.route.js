import express from "express";
import {
  checkAvailability,
  allocateRoom,
  allBookedRoom,
  deleteBookedRoom,
  getPendingBookings,
  approveGuestBooking,
  rejectGuestBooking,
  getBookingRecord,
} from "../controller/guest.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/see-availability", verifyJWT, checkAvailability);
router.post("/book-guest-room", verifyJWT, allocateRoom);
router.get("/booked-guest-rooms", verifyJWT, allBookedRoom); // to get all the booked guest rooms
router.delete("/cancel-booking", verifyJWT, deleteBookedRoom);

// Admin approval routes
router.get("/pending-bookings", verifyJWT, getPendingBookings);
router.patch("/approve-booking/:bookingId", verifyJWT, approveGuestBooking);
router.patch("/reject-booking/:bookingId", verifyJWT, rejectGuestBooking);

// Booking record route
router.get("/booking-record/:bookingId", verifyJWT, getBookingRecord);

export default router;
