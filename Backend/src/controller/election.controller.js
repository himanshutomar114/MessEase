import { Application, ElectionConfig, Vote } from "../model/election.model.js";
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
import Mess from "../model/mess.model.js";
import mongoose from "mongoose";
import College from "../model/college.model.js";

// ADMIN CONTROLLERS

// Get all election configurations
export const getAllElectionConfigs = async (req, res) => {
  try {
    const collegeId = req.user.college;
    const electionConfigs = await ElectionConfig.find({ college: collegeId })
      .populate("targetId")
      .sort({ createdAt: -1 });
    // Map through each config to add the name property
    const configsWithNames = await Promise.all(
      electionConfigs.map(async (config) => {
        // Convert to plain object so we can modify it
        const configObj = config.toObject();
        // Check if targetId exists for this config
        if (configObj.targetId && configObj.targetId._id) {
          try {
            let name = null;
            name = await Hostel.findById(configObj.targetId._id).select("name");
            if (!name) {
              name = await Mess.findById(configObj.targetId._id).select("name");
            }
            if (name && name.name) {
              configObj.name = name.name;
            }
          } catch (err) {
            console.error(
              `Error finding name for targetId ${configObj.targetId._id}:`,
              err
            );
          }
        }

        return configObj;
      })
    );

    return res.status(200).json({
      success: true,
      data: configsWithNames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election configurations",
      error: error.message,
    });
  }
};

// Create a new election configuration
export const createElectionConfig = async (req, res) => {
  try {
    const { type, targetId, questions } = req.body;
    const college = req.user.college;
    // Validate target exists (mess or hostel)
    let targetExists;
    if (type === "messManager") {
      targetExists = await Mess.findById(targetId);
    } else {
      targetExists = await Hostel.findById(targetId);
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${type === "messManager" ? "Mess" : "Hostel"} not found`,
      });
    }

    // Check if an active election already exists
    const activeElection = await ElectionConfig.findOne({
      type,
      targetId,
      $or: [
        { "applicationPhase.isOpen": true },
        { "votingPhase.isOpen": true },
        { "result.winnerId": { $exists: false } },
      ],
    });

    if (activeElection) {
      return res.status(400).json({
        success: false,
        message: "An active election already exists for this target",
        castAlready: true,
      });
    }

    const newElectionConfig = new ElectionConfig({
      type,
      targetId,
      "applicationPhase.questions": questions,
      college,
    });

    await newElectionConfig.save();

    return res.status(201).json({
      success: true,
      message: "Election configuration created successfully",
      data: newElectionConfig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create election configuration",
      error: error.message,
    });
  }
};

// Toggle application phase
export const toggleApplicationPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Cannot open application if voting is open
    if (!election.applicationPhase.isOpen && election.votingPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Cannot open applications while voting is in progress",
      });
    }

    // Toggle state and record timestamp
    election.applicationPhase.isOpen = !election.applicationPhase.isOpen;
    if (election.applicationPhase.isOpen) {
      election.applicationPhase.openedAt = new Date();
    } else {
      election.applicationPhase.closedAt = new Date();
    }

    await election.save();

    return res.status(200).json({
      success: true,
      message: `Application phase ${election.applicationPhase.isOpen ? "opened" : "closed"} successfully`,
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle application phase",
      error: error.message,
    });
  }
};

// Select candidates from applications
export const selectCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationIds } = req.body;

    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Application phase should be closed
    if (election.applicationPhase.isOpen) {
      return res.status(200).json({
        success: false,
        phase: true,
        message: "Close application phase before selecting candidates",
      });
    }
    // Validate all applicationIds
    const applications = await Application.find({
      _id: { $in: applicationIds },
      position: election.type,
      targetId: election.targetId,
    });

    if (applications.length !== applicationIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more application IDs are invalid",
      });
    }

    // Update application status
    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { status: "approved" }
    );

    // Reject other applications
    await Application.updateMany(
      {
        position: election.type,
        targetId: election.targetId,
        _id: { $nin: applicationIds },
      },
      { status: "rejected" }
    );

    // Update candidates list
    election.votingPhase.candidates = applications.map((app) => ({
      applicationId: app._id,
      userId: app.user,
    }));

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Candidates selected successfully",
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to select candidates",
      error: error.message,
    });
  }
};

// Toggle voting phase
export const toggleVotingPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Cannot open voting if application is open
    if (!election.votingPhase.isOpen && election.applicationPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Cannot start voting while application phase is open",
      });
    }

    // Need candidates to open voting
    if (
      !election.votingPhase.isOpen &&
      election.votingPhase.candidates.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot start voting without candidates",
      });
    }

    // Toggle state and record timestamp
    election.votingPhase.isOpen = !election.votingPhase.isOpen;
    if (election.votingPhase.isOpen) {
      election.votingPhase.openedAt = new Date();
    } else {
      election.votingPhase.closedAt = new Date();

      // Calculate results when closing voting
      await calculateResults(id);
    }

    await election.save();

    return res.status(200).json({
      success: true,
      message: `Voting phase ${election.votingPhase.isOpen ? "opened" : "closed"} successfully`,
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle voting phase",
      error: error.message,
    });
  }
};

// Helper function to calculate results
const calculateResults = async (electionId) => {
  const votes = await Vote.find({ election: electionId });
  const voteCounts = {};

  // Count votes for each candidate
  for (const vote of votes) {
    const candidateId = vote.candidate.toString();
    voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
  }

  let winnerIdString = null;
  let maxVotes = 0;

  // Find the winner (most votes)
  for (const [candidateId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerIdString = candidateId;
    }
  }

  // Update election with winner
  if (winnerIdString) {
    const winnerId = new mongoose.Types.ObjectId(winnerIdString);
    const winner = await User.findById(winnerId).select(
      "name branch year email"
    );
    const winnerWithVoteCount = { ...winner, voteCount: maxVotes };
    await ElectionConfig.findByIdAndUpdate(electionId, {
      "result.winnerId": winnerWithVoteCount,
      "result.announcedAt": new Date(),
    });

    // Update user role based on election type
    const election = await ElectionConfig.findById(electionId);
    if (election) {
      await User.findByIdAndUpdate(winnerId, { role: election.type });
    }
  }
};

// Get all applications for an election
export const getApplications = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const applications = await Application.find({
      position: election.type,
      targetId: election.targetId,
    }).populate(
      "user",
      "name email branch year rollNumber profilePicture room phoneNumber"
    );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// STUDENT CONTROLLERS

// Get available elections for a student
export const getAvailableElections = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get elections relevant to the student's hostel and mess
    const elections = await ElectionConfig.find({
      $or: [
        { targetId: user.hostel, type: "hostelManager" },
        { targetId: user.mess, type: "messManager" },
      ],
      $or: [
        { "applicationPhase.isOpen": true },
        { "votingPhase.isOpen": true },
        { "result.winnerId": { $exists: true } },
      ],
    }).populate("targetId");

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available elections",
      error: error.message,
    });
  }
};

// Submit an application
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { electionId, answers } = req.body;

    const user = await User.findById(userId);
    const election = await ElectionConfig.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if application phase is open
    if (!election.applicationPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Application phase is not open",
      });
    }

    // Check if user belongs to the target hostel/mess
    if (
      (election.type === "hostelManager" &&
        user.hostel.toString() !== election.targetId.toString()) ||
      (election.type === "messManager" &&
        user.mess.toString() !== election.targetId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: `You can only apply for your own ${election.type === "hostelManager" ? "hostel" : "mess"}`,
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      user: userId,
      position: election.type,
      targetId: election.targetId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this position",
      });
    }

    // Format answers
    const formattedAnswers = election.applicationPhase.questions.map(
      (question, index) => ({
        question,
        answer: answers[index] || "",
      })
    );

    // Create application
    const application = new Application({
      user: userId,
      position: election.type,
      targetId: election.targetId,
      answers: formattedAnswers,
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

// Get candidates for voting
export const getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId)
      .populate({
        path: "votingPhase.candidates.userId",
        select: "name email branch year",
      })
      .populate({
        path: "votingPhase.candidates.applicationId",
      });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: election.votingPhase.candidates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

// Cast a vote
export const castVote = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { electionId, candidateId } = req.body;

    const election = await ElectionConfig.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if voting phase is open
    if (!election.votingPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Voting is not open",
      });
    }

    // Check if candidateId is valid
    const isValidCandidate = election.votingPhase.candidates.some(
      (candidate) => candidate.userId.toString() === candidateId
    );

    if (!isValidCandidate) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      election: electionId,
      voter: userId,
    });

    if (existingVote) {
      return res.status(250).json({
        success: false,
        message: "You have already cast your vote for this election",
        castAlready: true,
      });
    }

    // Create vote
    const vote = new Vote({
      election: electionId,
      voter: userId,
      candidate: candidateId,
    });

    await vote.save();

    return res.status(201).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cast vote",
      error: error.message,
    });
  }
};

// Get election results
export const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId).populate(
      "result.winnerId",
      "name email branch year"
    );
    // console.log(election)

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if results are announced (voting closed)
    if (!election.result.winnerId) {
      return res.status(400).json({
        success: false,
        message: "Results not yet announced",
      });
    }

    // Get vote counts for all candidates
    const votes = await Vote.find({ election: electionId });
    const candidates = election.votingPhase.candidates;

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const candidateId = candidate.userId.toString();
        const voteCount = votes.filter(
          (vote) => vote.candidate.toString() === candidateId
        ).length;
        const user = await User.findById(candidateId, "name email branch year");

        return {
          candidate: user,
          voteCount,
          isWinner: election.result.winnerId.toString() === candidateId,
        };
      })
    );

    // Sort by vote count in descending order
    results.sort((a, b) => b.voteCount - a.voteCount);

    return res.status(200).json({
      success: true,
      announcedAt: election.result.announcedAt,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election results",
      error: error.message,
    });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { electionId } = req.params;

    let election = await ElectionConfig.findById(electionId).populate(
      "result.winnerId",
      "name email branch year"
    ); // Populate winner details if exists

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }
    const college = await College.findById(election.college).select("name");

    const targetId = election.targetId;
    let name;

    const hostel = await Hostel.findById(targetId).select("name");
    if (hostel) {
      name = hostel.name;
    } else {
      const mess = await Mess.findById(targetId).select("name");
      if (mess) {
        name = mess.name;
      }
    }

    // Convert Mongoose document to plain object and add `name` field
    let electionData = election.toObject();
    electionData.name = name;
    electionData.collegeName = college.name;

    return res.status(200).json({
      success: true,
      data: electionData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election",
      error: error.message,
    });
  }
};

export const votedOrNot = async (req, res) => {
  const { electionId } = req.params;
  const voterId = req.user._id;
  const vote = await Vote.findOne({ election: electionId, voter: voterId });
  if (vote) {
    return res.status(250).json({
      success: true,
      hasVoted: true,
      data: vote,
    });
  } else {
    return res.status(200).json({
      success: false,
      hasVoted: false,
      message: "No vote found for the given voter and election.",
    });
  }
};

export const getStudentElections = async (req, res) => {
  try {
    const { mess: messId, hostel: hostelId } = req.user;

    if (!messId && !hostelId) {
      return res.status(400).json({
        success: false,
        message: "User is not assigned to any mess or hostel",
      });
    }

    // Build conditions based on user's assigned mess and hostel
    const typeConditions = [];
    if (messId) {
      typeConditions.push({ type: "messManager", targetId: messId });
    }
    if (hostelId) {
      typeConditions.push({ type: "hostelManager", targetId: hostelId });
    }

    // Build the status condition: elections that are open (applications or voting) or have results announced.
    const statusCondition = {
      $or: [
        { "applicationPhase.isOpen": true },
        { "votingPhase.isOpen": true },
        { "result.winnerId": { $exists: true } },
      ],
    };

    // Combine both conditions using $and
    const query = {
      $and: [{ $or: typeConditions }, statusCondition],
    };

    // Query elections without populating
    const elections = await ElectionConfig.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    // Fetch names for each election
    for (let election of elections) {
      let name = null;

      const hostel = await Hostel.findById(election.targetId).select("name");
      if (hostel) {
        name = hostel.name;
      } else {
        const mess = await Mess.findById(election.targetId).select("name");
        if (mess) {
          name = mess.name;
        }
      }

      // Add name field to election object
      election.name = name;
    }

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    console.error("Error fetching student elections:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
