import GuestRoom from "../model/guest.model.js";
import express from "express";
import User from "../model/user.model.js";
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
    });

    res.status(200).json({ message: "Room booked successfully!", bookedRoom });
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
    const date = new Date();
    const activeRooms = await GuestRoom.find({
      guest: userId, // Convert userId to ObjectId
      checkOutDate: { $gt: date },
    }).sort({ checkInDate: 1 }); // to get all the booked guest rooms with inc order of checkin so that the user will see the first coming booking first
    // console.log(activeRooms);
    res.json(activeRooms);
  } catch (error) {
    console.error("Error fetching active rooms:", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteBookedRoom = async (req, res) => {
  try {
    const { bookingId } = req.query; // Changed from req.body to req.query
    const userId = req.user._id;
    // console.log(userId, bookingId);

    if (!userId || !bookingId) {
      return res
        .status(400)
        .json({ message: "User ID and Booking ID are required." });
    }

    // Find and delete the booking
    const deletedBooking = await GuestRoom.findOneAndDelete({
      _id: bookingId,
      guest: userId,
    });

    if (!deletedBooking) {
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
