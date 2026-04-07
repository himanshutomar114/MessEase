import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createComplaint } from "../controller/complaint.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { getComplaints } from "../controller/complaint.controller.js";
import { getMessComplaints } from "../controller/complaint.controller.js";
import { updateComplaint } from "../controller/complaint.controller.js";
import { UserComplaints } from "../controller/complaint.controller.js";
const router = express.Router();

router.post(
  "/createcomplaint",
  verifyJWT,
  upload.array("images", 5),
  createComplaint
);
router.get("/getcomplaints/:code", verifyJWT, getComplaints);
router.get("/getMessComplaints/:code", verifyJWT, getMessComplaints);
router.post("/updatecomplaint/:id/:status", verifyJWT, updateComplaint);
router.get("/usercomplaints", verifyJWT, UserComplaints);
export default router;
