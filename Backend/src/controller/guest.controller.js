import GuestRoom from "../model/guest.model.js";
import express from "express";
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
import mongoose from "mongoose";
export const checkAvailability = async (req, res) => {
  try {
    const { checkInDate } = req.body;
    const userId = req.user._id;

    // Fetch user details (college & hostel)
    const user = await User.findById(userId)
      .populate("hostel")
      .populate("college");

    // console.log("USER: ", user); // get to know the hostel in which user lives

    if (!user || !user.hostel) {
      return res.status(404).json({ error: "User or hostel not found" });
    }

    const { hostel, college } = user;
    // console.log("HOSTEL: ", hostel);
    // console.log("COLLEGE: ", college);
    // Get all rooms of this hostel
    const allRooms = hostel.guestRooms.roomNumbers;
    // console.log("AllRooms: ",allRooms);
    const occupiedRooms = await GuestRoom.find({
      hostel: hostel._id,
      checkOutDate: { $gt: new Date(checkInDate) },
    }).select("roomNumber");

    // console.log("OCC ROOMS: ",occupiedRooms);
    const occupiedRoomNumbers = occupiedRooms.map((room) => room.roomNumber);

    // Find available room numbers
    const freeRooms = allRooms.filter(
      (room) => !occupiedRoomNumbers.includes(room)
    );
    // console.log("FREE ROOMS: ",freeRooms);
    // console.log({ hostel: hostel.name, college: college.name, freeRooms });
    res.json({ hostel: hostel.name, college: college.name, freeRooms });
  } catch (error) {
    console.error("Error finding available rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allocateRoom = async (req, res) => {
  try {
    const { roomNumber, checkInDate, checkOutDate } = req.body;
    const userId = req.user._id;
    // console.log("BODY: ", req.body);
    if (!userId || !roomNumber || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId)
      .populate("hostel")
      .populate("college");

    const { hostel, college } = user;
    // console.log("HHHH: ", hostel);
    // console.log("CCCC: ", college);
    if (!hostel) {
      return res.status(400).json({ error: "User is not in any hostel " });
    }
    if (!college) {
      return res.status(400).json({ error: "User is not in any hostel " });
    }

    const isRoomOccupied = await GuestRoom.findOne({
      roomNumber,
      hostel: hostel._id,
      checkOutDate: { $gt: new Date(checkInDate) },
    });

    if (isRoomOccupied) {
      return res.status(400).json({ error: "Room is already booked" });
    }
    const bookedRoom = await GuestRoom.create({
      guest: userId,
      roomNumber,
      checkInDate,
      checkOutDate,
      hostel: hostel._id,
      status: "pending",
      approvalStatus: "pending",
    });

    res.status(200).json({ message: "Room booked successfully! Waiting for admin approval.", bookedRoom });
  } catch (error) {
    console.error("Error booking the room:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allBookedRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log(userId);
    if (!userId) {
      res.status(401).json({ error: "Not a valid User" });
    }
    // Fetch all bookings (active and inactive) with approval status
    const allBookings = await GuestRoom.find({
      guest: userId,
    })
      .populate("hostel", "name")
      .sort({ createdAt: -1 });
    // console.log(allBookings);
    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteBookedRoom = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const userId = req.user._id;

    if (!userId || !bookingId) {
      return res
        .status(400)
        .json({ message: "User ID and Booking ID are required." });
    }

    // Find and update the booking to mark as cancelled instead of deleting
    const cancelledBooking = await GuestRoom.findOneAndUpdate(
      {
        _id: bookingId,
        guest: userId,
      },
      {
        approvalStatus: "cancelled",
        status: "cancelled",
        cancelledBy: userId,
        cancellationDate: new Date(),
        cancellationReason: "Cancelled by student",
      },
      { new: true }
    );

    if (!cancelledBooking) {
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled." });
    }
    return res.status(200).json({ message: "Booking cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getPendingBookings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { hostelId } = req.query; // Accept hostelId from query params

    if (!hostelId) {
      return res.status(400).json({ error: "Hostel ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    // Verify admin owns this hostel
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    // Check authorization: admin owns hostel OR is hostelManager OR same college OR superAdmin
    const isAuthorized =
      admin.hostel?.toString() === hostelId ||
      admin.role === "hostelManager" ||
      admin.role === "superAdmin" ||
      admin.college?.toString() === hostel.college?.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Find all pending bookings for this hostel
    const pendingBookings = await GuestRoom.find({
      hostel: hostelId,
      approvalStatus: "pending",
    })
      .populate("guest", "name email rollNumber")
      .populate("hostel", "name code")
      .sort({ createdAt: -1 });

    res.json(pendingBookings);
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveGuestBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await GuestRoom.findById(bookingId)
      .populate("hostel")
      .populate({
        path: "hostel",
        populate: { path: "college" },
      });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify admin has access to this hostel
    const admin = await User.findById(adminId).populate("college").populate("hostel");
    
    const isAuthorized =
      (admin.hostel && admin.hostel._id.toString() === booking.hostel._id.toString()) ||
      (admin.college && admin.college._id.toString() === booking.hostel.college._id.toString()) ||
      admin.role === "superAdmin";

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized - You don't have access to this hostel" });
    }

    booking.approvalStatus = "approved";
    booking.status = "approved";
    booking.approvedBy = adminId;
    booking.approvalDate = new Date();

    await booking.save();

    res.json({ message: "Booking approved successfully", booking });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const rejectGuestBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await GuestRoom.findById(bookingId)
      .populate("hostel")
      .populate({
        path: "hostel",
        populate: { path: "college" },
      });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify admin has access to this hostel
    const admin = await User.findById(adminId).populate("college").populate("hostel");
    
    const isAuthorized =
      (admin.hostel && admin.hostel._id.toString() === booking.hostel._id.toString()) ||
      (admin.college && admin.college._id.toString() === booking.hostel.college._id.toString()) ||
      admin.role === "superAdmin";

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized - You don't have access to this hostel" });
    }

    booking.approvalStatus = "rejected";
    booking.status = "rejected";
    booking.approvedBy = adminId;
    booking.approvalDate = new Date();
    booking.rejectionReason = rejectionReason || "No reason provided";

    await booking.save();

    res.json({ message: "Booking rejected successfully", booking });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingRecord = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await GuestRoom.findById(bookingId)
      .populate("guest", "name email rollNumber")
      .populate("hostel", "name location code")
      .populate("approvedBy", "name email")
      .populate("cancelledBy", "name email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify ownership (student can only see own bookings, admin can see all)
    const isStaff = booking.guest._id.toString() === userId.toString();
    if (!isStaff) {
      const admin = await User.findById(userId);
      if (admin.role !== "admin" && admin.role !== "hostelManager") {
        return res.status(403).json({ error: "Unauthorized access" });
      }
    }

    res.json({
      booking,
      approvalHistory: {
        approvalStatus: booking.approvalStatus,
        approvedBy: booking.approvedBy,
        approvalDate: booking.approvalDate,
        rejectionReason: booking.rejectionReason,
        cancelledBy: booking.cancelledBy,
        cancellationDate: booking.cancellationDate,
        cancellationReason: booking.cancellationReason,
      },
    });
  } catch (error) {
    console.error("Error fetching booking record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getActiveBookings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { hostelId } = req.query;

    if (!hostelId) {
      return res.status(400).json({ error: "Hostel ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    // Verify admin has access to this hostel
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    // Check authorization: admin owns hostel OR is hostelManager OR same college OR superAdmin
    const isAuthorized =
      admin.hostel?.toString() === hostelId ||
      admin.role === "hostelManager" ||
      admin.role === "superAdmin" ||
      admin.college?.toString() === hostel.college?.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active bookings (approved and currently active based on check-in/check-out dates)
    const activeBookings = await GuestRoom.find({
      hostel: hostelId,
      approvalStatus: "approved",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: today },
    })
      .populate("guest", "name email rollNumber")
      .sort({ checkInDate: -1 });

    res.json(activeBookings);
  } catch (error) {
    console.error("Error fetching active bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { hostelId } = req.query;

    if (!hostelId) {
      return res.status(400).json({ error: "Hostel ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ error: "Invalid hostel ID" });
    }

    // Verify admin has access to this hostel
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    // Check authorization: admin owns hostel OR is hostelManager OR same college OR superAdmin
    const isAuthorized =
      admin.hostel?.toString() === hostelId ||
      admin.role === "hostelManager" ||
      admin.role === "superAdmin" ||
      admin.college?.toString() === hostel.college?.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Get all bookings (including cancelled, rejected) for this hostel
    const allBookings = await GuestRoom.find({
      hostel: hostelId,
    })
      .populate("guest", "name email rollNumber")
      .populate("approvedBy", "name")
      .populate("cancelledBy", "name")
      .sort({ createdAt: -1 });

    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
