import express from "express";
import {
  createHostel,
  fetchAllHostels,
  // getChats,
  getHostelByCode,
  getHostelMess,
  getHostelsWithoutMess,
  updateHostel,
} from "../controller/hostel.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create-hostel", verifyJWT, createHostel);
router.post("/fetchAllHostels", verifyJWT, fetchAllHostels);
router.get("/:code", verifyJWT, getHostelByCode);
router.put("/update/:code", verifyJWT, updateHostel);
router.post("/without-mess", verifyJWT, getHostelsWithoutMess);
router.post("/getHostelMess", verifyJWT, getHostelMess);
// router.get("/getChats",getChats);

export default router;
