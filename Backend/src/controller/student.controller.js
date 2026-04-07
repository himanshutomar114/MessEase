import User from "../model/user.model.js";
import College from "../model/college.model.js";
import nodemailer from "nodemailer";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import Hostel from "../model/hostel.model.js";
import Mess from "../model/mess.model.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import { createOtpMailOptions } from "../util/mailTemplateOTP.js";
import { createOtpMailOptions as registerMail } from "../util/mailTemplateRegistration.js";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

export const registerStudent = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Extract domain and start college lookup
    const domain = email.split("@")[1];
    const collegePromise = College.findOne({ domain });

    // Start user existence check in parallel
    const existingUserPromise = User.findOne({ email });

    // Wait for college check result
    const college = await collegePromise;
    if (!college) {
      return res.status(400).json({ message: "College domain doesn't exist." });
    }
    if (college.status === "unverified")
      return res.status(400).json({ message: "College domain is unverified." });

    // Wait for user check result
    const existingUser = await existingUserPromise;
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expirationTime });

    // Prepare email
    const mailOptions = registerMail(email, name, otp);

    // Respond to user immediately
    res.status(200).json({ message: "OTP sent to email." });

    // Set up automatic deletion in the background
    setTimeout(
      () => {
        const currentOtpData = otpStore.get(email);
        if (currentOtpData && currentOtpData.otp === otp) {
          otpStore.delete(email);
        }
      },
      10 * 60 * 1000
    );

    // Send email in the background without blocking the response
    transporter.sendMail(mailOptions).catch((error) => {
      console.error("Email error details:", error);
      // Log to monitoring system since we've already responded to the client
    });
  } catch (error) {
    console.error("Error in registerStudent:", error);
    return res.status(500).json({
      message: "Failed to register student",
      error: error.message,
    });
  }
};

export const verifyStudentOTP = async (req, res) => {
  const { email, otp, password, name } = req.body;

  const domain = email.split("@")[1];
  const findCollege = await College.findOne({ domain });

  // Check if OTP exists
  if (!otpStore.has(email)) {
    return res
      .status(400)
      .json({ message: "OTP expired or invalid. Try again." });
  }

  const storedOtpData = otpStore.get(email);

  // Check if OTP is expired
  if (Date.now() > storedOtpData.expirationTime) {
    otpStore.delete(email); // Clean up expired OTP
    return res.status(400).json({ message: "OTP expired. Try again." });
  }

  // Check if OTP matches
  if (storedOtpData.otp != otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  // OTP is valid, delete it
  otpStore.delete(email);

  const newUser = new User({
    email,
    password,
    name,
    role: "student",
    college: findCollege._id,
  });
  await newUser.save();

  const accessToken = newUser.generateAccessToken();
  const refreshToken = newUser.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "Signup successful", accessToken, refreshToken });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user without waiting - we'll handle the response later
    const userPromise = User.findOne({ email }).select("name");
    // Generate OTP while the DB query is running
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP immediately
    otpStore.set(email, { otp, expirationTime });

    // Now await the user result
    const existingUser = await userPromise;
    if (!existingUser) {
      return res.status(400).json({ message: "User doesn't exist." });
    }

    // Prepare email content
    const mailOptions = createOtpMailOptions(email, existingUser.name, otp);

    // Send email without waiting for it to complete
    const emailPromise = transporter.sendMail(mailOptions);

    // Set up automatic deletion without awaiting
    setTimeout(
      () => {
        const currentOtpData = otpStore.get(email);
        if (currentOtpData && currentOtpData.otp === otp) {
          otpStore.delete(email);
        }
      },
      10 * 60 * 1000
    );

    // Respond to the user immediately
    res.status(200).json({ message: "OTP sent to email." });

    // Continue with email sending in the background
    await emailPromise.catch((error) => {
      console.error("Email error details:", error);
      // We can't send an error response here since we've already sent a success response
      // Consider logging this to a monitoring system
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Check if OTP exists
    if (!otpStore.has(email)) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid. Try again." });
    }

    const storedOtpData = otpStore.get(email);

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expirationTime) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json({ message: "OTP expired. Try again." });
    }

    // Check if OTP matches
    if (storedOtpData.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid, delete it
    otpStore.delete(email);

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User doesn't exists." });

    // console.log("Existing User:", existingUser.password);
    existingUser.password = password;
    await existingUser.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(400).json({ message: "Server Error." });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    role: { $in: ["student", "hostelManager", "messManager"] },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid User." });
  }

  if (!user.password) {
    return res.status(400).json({
      message:
        "User registered via Google. Please use Google login or set a password.",
    });
  }

  if (!(await user.isPasswordCorrect(password))) {
    return res.status(400).json({ message: "Invalid Password." });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  // console.log("3");
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };

  const {
    googleId: ___,
    password: __,
    refreshToken: _,
    ...userData
  } = user._doc;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userData,
    });
};

export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    // Verify the token from Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, sub, picture } = ticket.getPayload();

    // Extract the domain from the email and check for college existence
    const domain = email.split("@")[1];
    const college = await College.findOne({ domain });
    if (!college) {
      return res.status(220).json({ message: "College domain doesn't exist." });
    }
    if (college.status === "unverified")
      return res.status(400).json({ message: "College domain is unverified." });

    // Check if a student exists with this googleId
    let user = await User.findOne({
      googleId: sub,
      role: { $in: ["student", "hostelManager", "messManager"] },
    }).select("-password -refreshToken");

    // Also check if a student exists with this email (registered via email/password)
    const userWithEmail = await User.findOne({
      email,
      role: { $in: ["student", "hostelManager", "messManager"] },
    }).select("googleId");

    // If a user exists with the same email but without a googleId, link the accounts.
    if (userWithEmail && !userWithEmail.googleId) {
      userWithEmail.googleId = sub;
      // Optionally update additional fields like name or picture
      userWithEmail.fullName = name;
      userWithEmail.profilePicture = picture;
      await userWithEmail.save();
      user = userWithEmail;
    }

    // If user exists (either previously linked or already had a googleId)
    if (user) {
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user,
          accessToken,
          refreshToken,
          first: false,
          message: "User logged in successfully",
        });
    } else {
      // No user exists with this googleId or email, so create a new student account
      user = await User.create({
        fullName: name,
        googleId: sub,
        username: email,
        college: college._id,
        email,
        profilePicture: picture,
        role: "student",
        first: true,
      });
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user,
          accessToken,
          refreshToken,
          message: "User signed in successfully",
        });
    }
  } catch (error) {
    console.error("Google Authentication Error:", error);
    return res.status(401).json({
      message: error?.message || "Google Login Failed",
    });
  }
};

/**
 * Logout User
 * Clears authentication cookies and unsets refreshToken in DB.
 * Assumes req.user is set by an authentication middleware.
 */
export const logout = async (req, res) => {
  try {
    // console.log("yyhg");
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const verifyToken = async (req, res) => {
  const hostelCode = await Hostel.findById(req.user.hostel).select("code");
  // console.log("HostelCOde", hostelCode);
  if (!hostelCode?.code) {
    return res.status(250).json({
      user: req.user._id,
      userInfo: req.user,
    });
  }
  const userInfo = { ...req.user._doc };
  delete userInfo.password;
  delete userInfo.googleId;
  delete userInfo.refreshToken;

  return res.status(200).json({
    user: req.user._id,
    userInfo,
    code: hostelCode?.code,
  });
};

export const getStudent = async (req, res) => {
  const { id } = req.params;

  const student = await User.findById(id);

  if (!student) {
    return res.status(404).json({
      message: "Student doesnt exist with this id",
      success: false,
    });
  }

  return res.status(200).json({
    user,
    success: true,
    message: "Student retrieved successfully",
  });
};

export const checkHostelAssignment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate("hostel");
  const userData = {
    role: user.role,
    isBlocked: user.isBlocked,
    hostel: user.hostel,
  };
  // console.log(userData)

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Hostel assignment checked successfully")
    );
});

// Update user profile including hostel
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, branch, year, room, phoneNumber, hostelId, rollNumber } =
    req.body;

  if (
    !name &&
    !branch &&
    !year &&
    !room &&
    !phoneNumber &&
    !hostelId &&
    !rollNumber
  ) {
    throw new ApiError(400, "At least one field is required for update");
  }

  // Start building the update object
  const updateFields = {};

  if (name) updateFields.name = name;
  if (branch) updateFields.branch = branch;
  if (year) updateFields.year = year;
  if (room) updateFields.room = room;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (rollNumber) updateFields.rollNumber = rollNumber;

  // If hostelId is provided, fetch hostel in parallel with other operations
  let hostelPromise;
  if (hostelId) {
    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      throw new ApiError(400, "Invalid hostel ID");
    }
    updateFields.hostel = hostelId;
    hostelPromise = Hostel.findById(hostelId).select("mess");
  }

  // Start user update process
  const updateUserPromise = User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  // Wait for both operations if needed
  const [hostel, updatedUser] = await Promise.all([
    hostelPromise,
    updateUserPromise,
  ]);

  // If hostel has a mess, update user's mess field in a separate operation
  if (hostel?.mess) {
    // No need to wait for this update as we already have the updated user
    User.updateOne(
      { _id: req.user?._id },
      { $set: { mess: hostel.mess } }
    ).catch((err) => console.error("Error updating mess field:", err));
  }

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const profilePictureFile = req.file;

  if (!profilePictureFile) {
    throw new ApiError(400, "Profile picture file is required");
  }

  const profilePicturePath = profilePictureFile.path;

  // Add file type validation
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(profilePicturePath); // Delete the invalid file
    throw new ApiError(
      400,
      "Invalid file type. Only JPEG, PNG and GIF are allowed"
    );
  }

  // Start user lookup in parallel with Cloudinary upload
  const userPromise = User.findById(req.user?._id).select("profilePicture");
  const uploadPromise = uploadOnCloudinary(profilePicturePath);

  // Wait for both operations
  const [user, cloudinaryResponse] = await Promise.all([
    userPromise,
    uploadPromise,
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!cloudinaryResponse?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // Delete old profile picture if exists (don't block the response for this)
  if (user.profilePicture) {
    try {
      const oldAvatarUrl = user.profilePicture;
      const publicId = oldAvatarUrl.split("/").pop().split(".")[0];
      // Don't await this operation
      cloudinary.uploader
        .destroy(publicId)
        .then(() => console.log("Old avatar deleted successfully"))
        .catch((error) => console.error("Error deleting old avatar:", error));
    } catch (error) {
      console.error("Error processing old avatar URL:", error);
    }
  }

  // Update user with new profile picture
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { profilePicture: cloudinaryResponse.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});

// Get all students with filtering, sorting, and pagination
export const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      branch,
      year,
      hostel,
      role,
      blockStatus, // new parameter to filter active/blocked students
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    // Extract college from authenticated admin user
    const collegeId = req.user.college;

    // Base query - only get users from admin's college
    const query = { college: collegeId };

    // Add role filter - if provided, otherwise default to student roles
    if (role) {
      // If multiple roles are provided as comma-separated string
      if (role.includes(",")) {
        query.role = { $in: role.split(",") };
      } else {
        query.role = role;
      }
    } else {
      // Default to showing only student/hostelManager/messManager roles
      query.role = { $in: ["student", "hostelManager", "messManager"] };
    }

    // Add branch filter if provided
    if (branch) {
      query.branch = branch;
    }

    // Add year filter if provided
    if (year) {
      query.year = parseInt(year);
    }

    // Add hostel filter if provided
    if (hostel) {
      query.hostel = new mongoose.Types.ObjectId(hostel);
    }

    // Add block status filter if provided
    if (blockStatus) {
      if (blockStatus === "active") {
        query.isBlocked = false;
      } else if (blockStatus === "blocked") {
        query.isBlocked = true;
      }
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { room: { $regex: search, $options: "i" } },
      ];
    }

    // Determine sort direction
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Prepare sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const students = await User.find(query)
      .populate("hostel", "name") // Only populate name field from hostel
      .select("-password -refreshToken") // Exclude sensitive fields (block fields remain)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const totalCount = await User.countDocuments(query);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          students,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        },
        "Students fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching students: " + error.message);
  }
});

// Get available filter options for the admin panel
export const getFilterOptions = asyncHandler(async (req, res) => {
  try {
    const collegeId = req.user.college;

    // Get unique branches
    const branches = await User.distinct("branch", {
      college: collegeId,
      branch: { $ne: null, $ne: "" },
    });

    // Get unique years
    const years = await User.distinct("year", {
      college: collegeId,
      year: { $ne: null },
    });

    // Get unique hostels
    const hostels = await Hostel.find({ college: collegeId })
      .select("name")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          branches,
          years,
          hostels,
          roles: ["student", "hostelManager", "messManager"],
          blockStatusOptions: ["active", "blocked"], // new filter options for block status
        },
        "Filter options fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching filter options: " + error.message);
  }
});

// Get detailed info about a specific student
export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findById(id)
      .populate("college", "name")
      .populate("hostel", "name")
      .populate("mess", "name")
      .select("-password -refreshToken");

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if admin has access to this student (same college)
    if (
      student.college &&
      req.user.college &&
      student.college._id.toString() !== req.user.college.toString()
    ) {
      throw new ApiError(
        403,
        "You don't have permission to access this student"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student details fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error fetching student details"
    );
  }
});

// Block/Unblock a student
export const toggleBlockStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isBlocked, blockedUntil } = req.body;

  try {
    const student = await User.findById(id);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if admin has access to this student (same college)
    if (student.college.toString() !== req.user.college.toString()) {
      throw new ApiError(
        403,
        "You don't have permission to block/unblock this student"
      );
    }

    const updates = { isBlocked };
    if (isBlocked && blockedUntil) {
      updates.blockedUntil = new Date(blockedUntil);
    } else if (!isBlocked) {
      updates.blockedUntil = null;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    const message = isBlocked
      ? "Student blocked successfully"
      : "Student unblocked successfully";
    return res.status(200).json(new ApiResponse(200, updatedStudent, message));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error toggling student block status"
    );
  }
});
