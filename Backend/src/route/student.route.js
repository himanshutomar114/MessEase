import express from "express";
import {
  registerStudent,
  verifyStudentOTP,
  loginStudent,
  googleAuth,
  logout,
  verifyToken,
  getStudent,
  checkHostelAssignment,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  forgotPassword,
  getStudentDiagnostics,
  getAcademics,
  updateAcademics,
  resetSemester,
} from "../controller/student.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/signup", registerStudent);
router.post("/verify-otp", verifyStudentOTP);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", changePassword);
router.post("/login", loginStudent);
router.post("/google", googleAuth);
router.post("/logout", verifyJWT, logout);
router.post("/verify-token", verifyJWT, verifyToken);
router.post("/getStudent/:id", verifyJWT, getStudent);
router.get("/check-hostel-assignment", verifyJWT, checkHostelAssignment);
router.get("/diagnostics", verifyJWT, getStudentDiagnostics);
router.get("/academics/get", verifyJWT, getAcademics);
router.post("/academics/update", verifyJWT, updateAcademics);
router.post("/academics/reset-semester", verifyJWT, resetSemester);
router.patch("/update-profile", verifyJWT, updateUserProfile);
router.post(
  "/upload-profile-picture",
  verifyJWT,
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
