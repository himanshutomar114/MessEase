import Hostel from "../model/hostel.model.js";
import crypto from "crypto";
import Mess from "../model/mess.model.js";

export const createHostel = async (req, res) => {
  try {
    const {
      name,
      location,
      totalRooms,
      roomCapacity,
      guestRooms,
      workers,
      collegeId,
    } = req.body;

    // Get the collegeId from either the request body or session
    const college = collegeId || req.user?.college;

    if (!college) {
      return res.status(400).json({ message: "College ID is required" });
    }

    const code = crypto.randomBytes(3).toString("hex");

    // Check if hostel with same name exists in the same college
    let hostel = await Hostel.findOne({ college, name });

    if (hostel) {
      return res
        .status(400)
        .json({ message: "Hostel with same name already exists" });
    }

    // Create the hostel with the provided data
    hostel = await Hostel.create({
      name,
      code,
      location,
      totalRooms,
      roomCapacity,
      guestRooms: {
        count: guestRooms.count,
        roomNumbers: guestRooms.roomNumbers,
      },
      college,
      workers: workers || [], // Include workers if provided
      admins: req.user?._id ? [req.user._id] : [], // Add current user as admin if available
    });

    return res.status(201).json({
      message: "Hostel created successfully",
      hostel: hostel,
    });
  } catch (error) {
    console.log("Error creating hostel:", error);
    return res.status(400).json({ message: "Error while creating hostel" });
  }
};

export const fetchAllHostels = async (req, res) => {
  try {
    const collegeId = req.user.college;

    if (!collegeId) {
      return res
        .status(430)
        .json({ message: "College ID is required", college: false });
    }

    // Find all hostels that belong to the specified college
    const hostels = await Hostel.find({ college: collegeId })
      .select("name location code totalRooms roomCapacity guestRooms.count")
      .sort({ createdAt: -1 });

    // Return the hostels data
    return res.status(200).json({
      success: true,
      message: "Hostels fetched successfully",
      hostels,
    });
  } catch (error) {
    console.error("Error fetching hostels:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching hostels",
      error: error.message,
    });
  }
};

export const getHostelByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Hostel code is required",
      });
    }
    // console.log("UUUUUUU ",req.user);
    const hostel = await Hostel.findOne({ code });
    // console.log("HHHHHHHHHHHH: ",hostel);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hostel fetched successfully",
      hostel,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching hostel:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching hostel",
      error: error.message,
    });
  }
};

export const updateHostel = async (req, res) => {
  try {
    const { code } = req.params;
    const { name, location, totalRooms, roomCapacity, guestRooms, workers } =
      req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Hostel code is required",
      });
    }

    // Find the hostel
    let hostel = await Hostel.findOne({ code });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // Check if changing name and if new name exists for same college
    if (name !== hostel.name) {
      const existingHostel = await Hostel.findOne({
        college: hostel.college,
        name,
        _id: { $ne: hostel._id }, // Exclude current hostel
      });

      if (existingHostel) {
        return res.status(400).json({
          success: false,
          message: "Hostel with same name already exists in this college",
        });
      }
    }

    // Update the hostel
    hostel.name = name;
    hostel.location = location;
    hostel.totalRooms = totalRooms;
    hostel.roomCapacity = roomCapacity;

    // Update guest rooms
    if (guestRooms) {
      hostel.guestRooms.count = guestRooms.count;

      // Update room numbers if provided
      if (guestRooms.roomNumbers) {
        hostel.guestRooms.roomNumbers = guestRooms.roomNumbers;
      }
    }

    // Update workers if provided
    if (workers) {
      hostel.workers = workers;
    }

    // Save the updated hostel
    await hostel.save();

    return res.status(200).json({
      success: true,
      message: "Hostel updated successfully",
      hostel,
    });
  } catch (error) {
    console.error("Error updating hostel:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating hostel",
      error: error.message,
    });
  }
};

export const getHostelsWithoutMess = async (req, res) => {
  try {
    // Find all hostels where the mess field is either undefined or null
    // const hostels = await Hostel.find({college: req.user.college});

    const hostels = await Hostel.find({
      $or: [{ mess: { $exists: false } }, { mess: null }],
      college: req.user.college,
    }).select("_id name location capacity code");

    // Return the list of hostels
    res.status(200).json(hostels);
  } catch (error) {
    console.error("Error fetching hostels without mess:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching hostels",
      error: error.message,
    });
  }
};

export const getHostelMess = async (req, res) => {
  try {
    const hostelId = req.user.hostel;
    if (!hostelId) {
      return res
        .status(400)
        .json({ message: "No hostel assigned", success: false });
    }
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res
        .status(401)
        .json({ message: "No hostel found with this ID", success: false });
    }

    const messId = hostel.mess;
    let mess;
    if (messId) {
      mess = await Mess.findById(messId);
    }

    return res.status(200).json({
      message: "Hostel successfully fetched",
      success: true,
      hostel,
      mess,
    });
  } catch (error) {
    return res.status(500).json({ message: "server error", success: false });
  }
};

// // getChats,

// export const getChats = async (req, res) => {
//   try {
//     const { hostelId, userId, code } = req.query;

//     console.log("G",req.query);
//         // Validate required fields
//     if (!hostelId || !userId || !code) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Fetch group chat that belongs to the hostelId
//     const groupChat = await GroupChat.findOne({ hostelId }) .populate("chats.sender", "name email")
//      // Populate sender details inside chats array
//       .sort({ createdAt: 1 }); // Sort messages from oldest to newest

//       console.log(groupChat);

//       const groupChat2 = await GroupChat.findOne({ hostelId }) .populate("chats.sender", "name email")
//       // Populate sender details inside chats array
//        .sort({ createdAt: 1 }); // Sort messages from oldest to newest

//        console.log(groupChat2);

//     return res.status(200).json({ success: true, chats: groupChat.chats });
//   } catch (error) {
//     console.error("Error fetching chats:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
