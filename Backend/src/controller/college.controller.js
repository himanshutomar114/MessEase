// controllers/collegeController.js
import College from "../model/college.model.js";
import User from "../model/user.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { createCollegeMailOptions } from "../util/mailCollegeRequest.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hardcoded developer email
const developerEmail = "harsh1618sharma@gmail.com";
const dev2Email = "meetkorat1406@gmail.com";

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

// Create a new college request
export const createCollegeRequest = asyncHandler(async (req, res) => {
  const {
    name,
    domain,
    adminPost,
    website,
    contactEmail,
    contactPhone,
    address,
  } = req.body;

  // Validate required fields
  if (!name || !domain || !adminPost || !address) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Find admin user without awaiting immediately
  const adminUserPromise = User.findById(req.user._id);

  // Generate a unique code in parallel
  const code = crypto.randomBytes(3).toString("hex");

  // Format the address for email
  const formattedAddress = `${address.street}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;

  // Now await the admin user result
  const adminUser = await adminUserPromise;
  if (!adminUser) {
    throw new ApiError(401, "Unauthorized access");
  }

  // Check if this domain already exists
  const existingCollegePromise = College.findOne({ domain });

  // Create college instance while waiting for domain check
  const newCollege = new College({
    name,
    domain,
    status: "unverified",
    code,
    website,
    contactEmail,
    contactPhone,
    address,
    admins: [adminUser._id],
  });

  // Check for existing college with same domain
  const existingCollege = await existingCollegePromise;
  if (existingCollege)
    return res
      .status(400)
      .json({ message: "College already exists with this domain" });

  // Save college and update admin user in parallel
  const saveCollegePromise = newCollege.save();

  adminUser.college = newCollege._id;
  const saveUserPromise = adminUser.save();

  // Wait for both save operations to complete
  await Promise.all([saveCollegePromise, saveUserPromise]);

  // Get current date for the email
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Prepare email
  const mailOptions = createCollegeMailOptions(
    developerEmail,
    name,
    currentDate,
    domain,
    adminPost,
    website,
    contactEmail,
    contactPhone,
    formattedAddress,
    code
  );

  // Send response immediately
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { collegeId: newCollege._id },
        "College request created. Awaiting verification."
      )
    );

  // Send email in the background
  transporter.sendMail(mailOptions).catch((error) => {
    console.error("Failed to send email notification:", error);
    // Log to monitoring system
  });
});

// Fetch college details using the unique code (for developer verification page)
export const getCollegeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    return res.status(200).json(college);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const applyRole = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      role, // Email of the user applying for the role
      email,
      collegeName,
      applicationDetails,
    } = req.body;
    // console.log("Code:", code);
    // console.log("Role:", role);
    // console.log("Email:", email);
    // console.log("College Name:", collegeName);
    // console.log("Application Details:", applicationDetails.collegeCode);

    // Create a transporter (configure with your email provider credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email (sender)
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email (your email)
      to: dev2Email, // Recipient's email (the user applying for the role)
      subject: "Role Application Confirmation", // Email subject
      html: `
        <h2>Role Application Confirmation</h2>
        <p>Here are the details:</p>
        <ul>
          <li><strong>Role:</strong> ${role}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>College Name:</strong> ${collegeName}</li>
          <li><strong>Applied At:</strong> ${applicationDetails.appliedAt}</li>
        </ul>
          <div style="margin-top: 20px;">
          <a href="http://localhost:4001/api/college/joinReq/${applicationDetails.collegeCode}/${email}/${role}/accept" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin-right: 10px; border-radius: 4px;">Accept</a>
          <a href="http://localhost:4001/api/college/joinReq/${applicationDetails.collegeCode}/reject" style="background-color: #f44336; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Reject</a>
        </div> `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.status(200).json({
      success: true,
      message:
        "Role application submitted successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error in applyRole:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const ReqAccept = async (req, res) => {
  try {
    const { code, role, email } = req.params;
    // console.log(code);
    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add user to admins array
    college.admins.push(user._id);
    await college.save();

    // Update user's role
    user.role = role;
    await user.save();

    return res
      .status(200)
      .json({ message: "User added as admin and role updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error in req accept" });
  }
};

export const ReqReject = async (req, res) => {
  try {
    const { code } = req.params;

    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error in req reject" });
  }
};
// Developer verifies or rejects the college request
export const verifyCollege = async (req, res) => {
  try {
    const { code, decision } = req.params;

    const college = await College.findOne({ code });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Create a transporter for sending email notifications
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (decision === "verify") {
      // Verify the college and update status
      college.status = "verified";
      await college.save();

      // Send notification email to the college admin contact email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: college.contactEmail,
        subject: "College Verified",
        html: `<p>Success! Your college "${college.name}" has been verified. You can now access college features.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(200)
        .json({ message: "College verified successfully." });
    } else if (decision === "reject") {
      // Delete the college request
      await College.deleteOne({ code });

      // Set the admin's college field to null
      const admin = await User.findOne({ college: college._id });
      if (admin) {
        admin.college = null;
        await admin.save();
      }

      // Send rejection email to the college admin
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: college.contactEmail,
        subject: "College Request Rejected",
        html: `<p>Your request for college "${college.name}" has been rejected.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(200)
        .json({ message: "College request rejected and deleted." });
    } else {
      return res.status(400).json({ message: "Invalid decision" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCollege = async (req, res) => {
  try {
    const collegeId = req.user.college;

    if (!collegeId) {
      return res
        .status(400)
        .json({ message: "College not assigned to user.", success: false });
    }

    const college = await College.findById(collegeId);

    if (!college) {
      return res
        .status(401)
        .json({ message: "College doesnt exist with this ID", success: false });
    }

    return res.status(200).json({
      message: "college fetched successfully",
      college,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update college details
export const updateCollegeDetails = asyncHandler(async (req, res) => {
  const { name, address, contactEmail, contactPhone, website } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is an admin
  if (user.role !== "admin") {
    throw new ApiError(
      403,
      "Unauthorized access. Only admins can update college details"
    );
  }

  if (!user.college) {
    throw new ApiError(404, "No college associated with this admin");
  }

  const college = await College.findById(user.college);

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  // Handle logo upload if provided
  const logoFile = req.file;

  if (logoFile) {
    // Add file type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(logoFile.mimetype)) {
      fs.unlinkSync(logoFile.path); // Delete the invalid file
      throw new ApiError(
        400,
        "Invalid file type. Only JPEG, PNG and GIF are allowed"
      );
    }

    // Delete old logo if exists
    if (college.logo) {
      try {
        const oldLogoUrl = college.logo;
        const publicId = oldLogoUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
        console.log("Old logo deleted successfully"); // Debug log
      } catch (error) {
        console.error("Error deleting old logo:", error); // Debug log
        // Continue anyway since we want to update the logo
      }
    }

    // Upload new logo
    const cloudinaryResponse = await uploadOnCloudinary(logoFile.path);

    if (!cloudinaryResponse?.url) {
      throw new ApiError(400, "Error while uploading logo");
    }

    college.logo = cloudinaryResponse.url;
  }

  // Update other fields if provided
  if (name) college.name = name;

  if (address) {
    college.address = {
      ...college.address,
      ...address,
    };
  }

  if (contactEmail) college.contactEmail = contactEmail;
  if (contactPhone) college.contactPhone = contactPhone;
  if (website) college.website = website;

  await college.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, college, "College details updated successfully")
    );
});
