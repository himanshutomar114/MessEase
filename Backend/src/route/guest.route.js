import express from "express";
import {
  checkAvailability,
  allocateRoom,
  allBookedRoom,
  deleteBookedRoom,
} from "../controller/guest.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/see-availability", verifyJWT, checkAvailability);
router.post("/book-guest-room", verifyJWT, allocateRoom);
router.get("/booked-guest-rooms", verifyJWT, allBookedRoom); // to get all the booked guest rooms
router.delete("/cancel-booking", verifyJWT, deleteBookedRoom);
export default router;
