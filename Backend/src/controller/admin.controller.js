// controllers/adminController.js
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
import College from "../model/college.model.js";
import { OAuth2Client } from "google-auth-library";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import GroupChat from "../model/groupchat.model.js";
import { v2 as cloudinary } from "cloudinary";
import { createOtpMailOptions } from "../util/mailTemplateOTP.js";
import { createOtpMailOptions as registerMail } from "../util/mailTemplateRegistration.js";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store OTPs in memory
const otpStore = new Map();

// Configure nodemailer transporter
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

// Admin Registration Controller with OTP
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Start user existence check but don't await immediately
    const existingUserPromise = User.findOne({ email });

    // Generate OTP in parallel with the DB query
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Now await the user check result
    const existingUser = await existingUserPromise;
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Store OTP
    otpStore.set(email, { otp, expirationTime });

    // Prepare email - assuming registerMail is similar to our createOtpMailOptions
    const mailOptions = registerMail(email, name, otp);

    // Respond to the user immediately
    res.status(200).json({ message: "OTP sent to email." });

    // Set up automatic deletion without blocking
    setTimeout(
      () => {
        const currentOtpData = otpStore.get(email);
        if (currentOtpData && currentOtpData.otp === otp) {
          otpStore.delete(email);
        }
      },
      10 * 60 * 1000
    );

    // Send email in the background (non-blocking)
    transporter.sendMail(mailOptions).catch((error) => {
      console.error("Email error details:", error);
      // Log to monitoring system since we can't respond to the client anymore
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify Admin OTP Controller
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp, password, name, phoneNumber } = req.body;

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

    // Create a new admin user
    const adminUser = new User({
      email,
      password,
      name,
      phoneNumber,
      role: "admin", // explicitly setting role to admin
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;

    const user = { email, name, phoneNumber, role: "admin" };

    await adminUser.save();

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Admin registered successfully",
        accessToken,
        refreshToken,
        user,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
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

    existingUser.password = password;
    await existingUser.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(400).json({ message: "Server Error." });
  }
};

// Admin Login Controller
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await User.findOne({
      email,
      role: { $in: ["admin", "accountant", "chiefWarden"] },
    });
    if (!adminUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!adminUser.password) {
      return res.status(400).json({
        message:
          "User registered via Google. Please use Google login or set a password.",
      });
    }

    // Verify password using the schema method
    const isMatch = await adminUser.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    // Generate JWT tokens using schema methods
    const accessToken = adminUser.generateAccessToken();
    const refreshToken = adminUser.generateRefreshToken();

    // Optionally, store the refresh token with the user
    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    const {
      googleId: ___,
      password: __,
      refreshToken: _,
      ...user
    } = adminUser._doc;

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCollege = async (req, res) => {
  try {
    const adminId = req.user._id; // Assuming you have middleware that sets `req.user`

    // Fetch the admin user with the associated college
    const adminUser = await User.findById(adminId).populate("college");

    if (!adminUser || !adminUser.college) {
      console.log("No college found");
      return res
        .status(205)
        .json({ message: "No college found or college not requested." });
    }

    const college = adminUser.college;

    // Check if the college is verified
    if (college.status !== "verified") {
      return res.status(207).json({ message: "College is not verified yet." });
    }

    return res.status(200).json({ college });
  } catch (error) {
    console.error("Error fetching college:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// Admin Google Auth Controller
export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub, picture } = ticket.getPayload();

    // Look for an admin with an existing googleId
    let admin = await User.findOne({
      googleId: sub,
      role: { $in: ["admin", "accountant", "chiefWarden"] },
    }).select("-password -refreshToken");
    // Look for an admin registered by email/password (without a googleId)
    let existingAdmin = await User.findOne({
      email: email,
      role: { $in: ["admin", "accountant", "chiefWarden"] },
    }).select("googleId");

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Use sameSite or other cookie options as needed
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    if (existingAdmin && !existingAdmin.googleId) {
      // Link the Google account with the existing email/password account
      existingAdmin.googleId = sub;
      // Optionally, update additional fields like name or picture
      existingAdmin.fullName = name;
      // Save the updated user
      admin = await existingAdmin.save();
    }

    if (admin) {
      // If the admin exists or was just linked, generate tokens
      const accessToken = admin.generateAccessToken();
      const refreshToken = admin.generateRefreshToken();

      admin.refreshToken = refreshToken;
      await admin.save();

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: admin, accessToken, refreshToken },
            "Admin logged in successfully"
          )
        );
    } else {
      // If no admin exists with this email, create a new admin account
      admin = await User.create({
        fullName: name,
        googleId: sub,
        email,
        role: "admin",
      });

      const accessToken = admin.generateAccessToken();
      const refreshToken = admin.generateRefreshToken();

      admin.refreshToken = refreshToken;
      await admin.save();

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: admin, accessToken, refreshToken },
            "Admin signed in successfully"
          )
        );
    }
  } catch (error) {
    console.error("Google Authentication Error (Admin):", error);
    throw new ApiError(401, error?.message || "Google Login Failed");
  }
};

// Admin Logout Controller
export const logoutAdmin = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",/
    sameSite: "none",
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

export const verifyToken = async (req, res) => {
  const userInfo = { ...req.user._doc };
  delete userInfo.password;
  delete userInfo.googleId;
  delete userInfo.refreshToken;

  if (userInfo.college) {
    const college = await College.findById(userInfo.college);
    if (college.status === "unverified") {
      return res.status(207).json({
        message: "College is not verified yet.",
        user: req.user._id,
        userInfo,
        hasCollege: true,
        verified: false,
        college,
      });
    }
    return res.status(200).json({
      user: req.user._id,
      userInfo,
      hasCollege: true,
      verified: true,
      college,
    });
  }

  return res.status(200).json({
    user: req.user._id,
    userInfo,
    hasCollege: false,
  });
};

// Get admin profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get college details if admin has a college association
  let collegeDetails = null;
  if (user.college) {
    collegeDetails = await College.findById(user.college).populate({
      path: "admins",
      select: "name email profilePicture",
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, collegeDetails },
        "Admin profile fetched successfully"
      )
    );
});

// Update admin profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber } = req.body;

  if (!name && !phoneNumber && !req.file) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const profilePictureFile = req.file;

  if (!profilePictureFile) {
    throw new ApiError(400, "Profile picture file is required");
  }

  // Assuming the file is saved and the path/URL is returned
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

  if (user.profilePicture) {
    try {
      const oldAvatarUrl = user.profilePicture;
      const publicId = oldAvatarUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      console.log("Old avatar deleted successfully"); // Debug log
    } catch (error) {
      console.error("Error deleting old avatar:", error); // Debug log
      // Continue anyway since we want to update the avatar
    }
  }

  const cloudinaryResponse = await uploadOnCloudinary(profilePicturePath);

  if (!cloudinaryResponse?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePicture: cloudinaryResponse.url,
        name,
        phoneNumber,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Admin profile updated successfully"));
});

export const createGroupChat = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID from the request
    const { code, groupName, hostelId } = req.body;
    // Check if a group already exists for this hostel
    const existingGroup = await GroupChat.findOne({ hostelId });
    // console.log(existingGroup);

    // console.log(existingGroup, "EXISTING GROUP");

    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "Group chat already exists for this hostel." });
    }

    // Create a new group chat
    const newGroup = new GroupChat({
      code,
      userId,
      groupName,
      hostelId,
    });

    await newGroup.save();

    await Hostel.findByIdAndUpdate(hostelId, { chatCreated: true });

    return res
      .status(201)
      .json({ message: "Group chat created successfully.", group: newGroup });

    // return res.status(201).json({ message: "Group chat created successfully.", group: newGroup });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getChats = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const userId = req.user._id; // Assuming you have user ID from the request
    const { hostelId, code } = req.query;
    const skip = (page - 1) * limit;
    // console.log("G", req.query);
    // Validate required fields
    if (!hostelId || !userId || !code) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const totalChats = await GroupChat.findOne({ hostelId }).select("chats");

    const groupChat = await GroupChat.findOne({ hostelId })
      .select({ chats: { $slice: [-skip - limit, limit] } }) // Fetch required slice
      .populate({
        path: "chats.sender",
        select: "name", // Select required fields
      })
      .sort({ "chats.timestamp": 1 }); // Sort messages from oldest to newest

    if (!groupChat) {
      return res
        .status(404)
        .json({ message: "Group chat not found", groupChat: false });
    }
    // console.log("CHAT2: ", groupChat);
    return res.status(200).json({
      success: true,
      chats: groupChat.chats,
      totalPages: Math.ceil((totalChats?.chats?.length || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadImage = asyncHandler(async (req, res) => {
  try {
    // console.log("UPLOAD IMAGE BODY: ", req.body);
    // console.log("UPLOAD IMAGE FINAL: ", req.file);
    const chatImage = await uploadOnCloudinary(req.file.path);
    // console.log("profilePicture", chatImage);
    return res.status(200).send({ imageUrl: chatImage.secure_url });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export const uploadAudio = asyncHandler(async (req, res) => {
  try {
    // console.log("UPLOAD Audio BODY: ", req.body);
    // console.log("UPLOAD Audio FINAL: ", req.file);
    const chatAudio = await uploadOnCloudinary(req.file.path);
    // console.log("audioImage", chatAudio);
    return res.status(200).send({ audioUrl: chatAudio.secure_url });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Upload failed" });
  }
});
