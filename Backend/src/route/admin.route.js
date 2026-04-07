// routes/adminRoutes.js
import express from "express";
import {
  registerAdmin,
  verifyAdminOTP,
  loginAdmin,
  getCollege,
  googleAuth,
  logoutAdmin,
  verifyToken,
  getAdminProfile,
  updateAdminProfile,
  forgotPassword,
  changePassword,
  createGroupChat,
  getChats,
  uploadImage,
  uploadAudio,
} from "../controller/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  getAllStudents,
  getFilterOptions,
  getStudentById,
  toggleBlockStudent,
} from "../controller/student.controller.js";
import { uploadAudioMulter } from "../middleware/multer.audio.middleware.js";
import { verify } from "crypto";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/verify-otp", verifyAdminOTP);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", changePassword);
router.post("/login", loginAdmin);
router.post("/college", verifyJWT, getCollege);
router.post("/google", googleAuth);
router.post("/logout", verifyJWT, logoutAdmin);
router.post("/verify-token", verifyJWT, verifyToken);
router.get("/profile", verifyJWT, getAdminProfile);
router.patch(
  "/update-profile",
  verifyJWT,
  upload.single("profilePicture"),
  updateAdminProfile
);
router.get("/students", verifyJWT, getAllStudents);
router.get("/students/filter-options", verifyJWT, getFilterOptions);
router.get("/students/:id", verifyJWT, getStudentById);
router.put("/students/:id/toggle-block", verifyJWT, toggleBlockStudent);
router.post("/createGroupChat", verifyJWT, createGroupChat);
router.get("/getChats", verifyJWT, getChats);
router.post(
  "/uploadImage",
  verifyJWT,
  // upload.single("profilePicture"),
  upload.single("chatImage"),
  uploadImage
);
router.post(
  "/uploadAudio",
  verifyJWT,
  // upload.single("profilePicture"),
  uploadAudioMulter.single("chatAudio"),
  uploadAudio
);
export default router;
