// routes/adminRoutes.js
import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  castVote,
  createElectionConfig,
  getAllElectionConfigs,
  getApplications,
  getAvailableElections,
  getCandidates,
  getElectionById,
  getElectionResults,
  getStudentElections,
  selectCandidates,
  submitApplication,
  toggleApplicationPhase,
  toggleVotingPhase,
  votedOrNot,
} from "../controller/election.controller.js";

const router = express.Router();

router.get("/admin/elections", verifyJWT, getAllElectionConfigs);
router.post("/admin/elections", verifyJWT, createElectionConfig);
router.patch(
  "/admin/:id/toggle-application",
  verifyJWT,
  toggleApplicationPhase
);
router.patch("/admin/:id/select-candidates", verifyJWT, selectCandidates);
router.patch("/admin/:id/toggle-voting", verifyJWT, toggleVotingPhase);
router.get("/admin/:electionId/applications", verifyJWT, getApplications);
router.get("/elections", verifyJWT, getAvailableElections);
router.post("/apply", verifyJWT, submitApplication);
router.get("/getElections", verifyJWT, getStudentElections);
router.get("/:electionId/candidates", verifyJWT, getCandidates);
router.post("/vote", verifyJWT, castVote);
router.get("/:electionId/results", verifyJWT, getElectionResults);
router.get("/:electionId", verifyJWT, getElectionById);
router.get("/:electionId/my-vote", verifyJWT, votedOrNot);

export default router;
