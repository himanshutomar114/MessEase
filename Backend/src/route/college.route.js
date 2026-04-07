// routes/collegeRoutes.js
import express from "express";
import {
  createCollegeRequest,
  getCollege,
  ReqAccept,
  ReqReject,
  getCollegeByCode,
  updateCollegeDetails,
  verifyCollege,
  applyRole,
} from "../controller/college.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/getCollege", verifyJWT, getCollege);
// Endpoint for admin to create a new college request
router.post("/create", verifyJWT, createCollegeRequest);

//Endpoint for admin to join a college
router.post("/join", verifyJWT);

// Endpoint to get college details for verification (developer view)
router.get("/verification/:code", getCollegeByCode);

// Endpoint for developer to verify or reject the college request
router.get("/verification/:code/:decision", verifyCollege);
router.patch(
  "/update-college",
  verifyJWT,
  upload.single("logo"),
  updateCollegeDetails
);
router.post("/apply-role", verifyJWT, applyRole);
router.get("/joinReq/:code/:email/:role/accept", ReqAccept);
router.get("/joinReq/:code/reject", ReqReject);

export default router;
