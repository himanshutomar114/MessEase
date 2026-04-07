import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./db/index.js"; // MongoDB connection
import adminRoutes from "./route/admin.route.js";
import collegeRoutes from "./route/college.route.js";
import studentRoutes from "./route/student.route.js";
import guestRoutes from "./route/guest.route.js";
import hostelRoutes from "./route/hostel.route.js";
import messRoutes from "./route/mess.route.js";
import electionRoutes from "./route/election.route.js";
import paymentRoutes from "./route/payment.route.js";
import complaintRoutes from "./route/complaint.route.js";
import marketplaceRoutes from "./route/market.route.js";
import marketchatRoute from "./route/market.chat.route.js";
import RazorPay from "razorpay";
import GroupChat from "./model/groupchat.model.js";
import mongoose from "mongoose";
import { CLIENT_URL } from "./constants.js";

dotenv.config({ path: "./.env" });

export const instance = new RazorPay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const clientUrl = CLIENT_URL || "http://localhost:8000";

const app = express();
const server = createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// });
// import marketchatRoute from "./route/market.chat.route.js";

// Store online users in a Map -> { hostelId: [{ userId, socketId }] }
const usersMap = new Map();
const activePollsByHostel = new Map();

io.on("connection", (socket) => {
  console.log("🔗 A user connected:", socket.id);

  // User joins a hostel chat
  socket.on("joinRoom", ({ hostelId, userId }) => {
    socket.join(hostelId);
    // console.log(`📢 User ${userId} joined hostel ${hostelId}`);

    if (!usersMap.has(hostelId)) usersMap.set(hostelId, []);
    usersMap.get(hostelId).push({ userId, socketId: socket.id });

    if (activePollsByHostel.has(hostelId)) {
      socket.emit("newPoll", activePollsByHostel.get(hostelId));
    }
    // io.to(hostelId).emit("userJoined", { userId, message: `${userId} joined the chat` });
  });

  socket.on("createPoll", async ({ poll, hostelId, code }) => {
    try {
      // console.log("Creating new poll:", poll);

      // Store the poll in our Map
      activePollsByHostel.set(hostelId, poll);

      // Optional: You could also save polls to your database
      // await Poll.create({
      //   pollId: poll.id,
      //   hostelId,
      //   code,
      //   question: poll.question,
      //   options: poll.options,
      //   createdBy: poll.createdBy,
      //   createdByName: poll.createdByName
      // });

      // Broadcast the new poll to all clients in the hostel room
      io.to(hostelId).emit("newPoll", poll);

      // console.log(`New poll created for hostel ${hostelId}`);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  });

  socket.on("votePoll", ({ pollId, userId, optionIndex, hostelId, code }) => {
    try {
      // console.log(
      //   `User ${userId} voted for option ${optionIndex} in poll ${pollId}`
      // );

      // Get the current poll
      const poll = activePollsByHostel.get(hostelId);

      // Check if poll exists and user hasn't voted yet
      if (!poll || poll.id !== pollId) {
        // console.log("Poll not found or poll ID mismatch");
        return;
      }

      // Check if user has already voted
      if (poll.voters[userId] !== undefined) {
        // console.log(`User ${userId} has already voted`);
        return;
      }

      // Update vote counts
      poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
      poll.voters[userId] = optionIndex;

      // Update the poll in our Map
      activePollsByHostel.set(hostelId, poll);

      // Optional: Update the poll in your database
      // await Poll.findOneAndUpdate(
      //   { pollId, hostelId },
      //   { $set: { votes: poll.votes, voters: poll.voters } }
      // );

      // Broadcast the updated poll to all clients in the hostel room
      io.to(hostelId).emit("pollVoteUpdated", poll);

      // console.log(`Vote recorded for poll ${pollId}`);
    } catch (error) {
      console.error("Error recording vote:", error);
    }
  });

  // Handle ending a poll
  socket.on("endPoll", ({ pollId, hostelId, code }) => {
    try {
      // console.log(`Ending poll ${pollId} for hostel ${hostelId}`);

      // Get the current poll
      const poll = activePollsByHostel.get(hostelId);

      // Check if poll exists
      if (!poll || poll.id !== pollId) {
        // console.log("Poll not found or poll ID mismatch");
        return;
      }

      // Remove the poll from our Map
      activePollsByHostel.delete(hostelId);

      // Optional: Update the poll status in your database
      // await Poll.findOneAndUpdate(
      //   { pollId, hostelId },
      //   { $set: { status: 'ended', endedAt: new Date() } }
      // );

      // Broadcast poll ended to all clients in the hostel room
      io.to(hostelId).emit("pollEnded");

      // console.log(`Poll ${pollId} ended successfully`);
    } catch (error) {
      console.error("Error ending poll:", error);
    }
  });

  const handleMarketChatEvents = () => {
    socket.on("joinChat", ({ buyerId, sellerId }) => {
      // Create a consistent room name by sorting the IDs
      // console.log("first", buyerId, sellerId);
      const chatRoom = [buyerId, sellerId].sort().join("-");
      socket.join(chatRoom);
      // console.log(`User joined chat: ${chatRoom}`);
    });

    socket.on("join", (userId) => {
      socket.join(userId); // User joins their own room (userId)
      // console.log(`User ${userId} joined their personal room`);
    });

    socket.on("sendMarketMessage", (message) => {
      // console.log("in my socket");
      const { senderId, receiverId } = message;
      // Use the same room naming strategy
      const chatRoom = [senderId, receiverId].sort().join("-");
      io.to(chatRoom).emit("receiveMessage", message);
    });
  };
  handleMarketChatEvents();

  socket.on(
    "sendMessage",
    async ({
      message,
      image,
      userId,
      hostelId,
      code,
      senderName,
      audioUrl,
    }) => {
      // console.log("B:", {
      //   userId,
      //   hostelId,
      //   message,
      //   code,
      //   senderName,
      //   hasImage: !!image,
      //   hasAudio: !!audioUrl,
      // });
      // console.log("in index.js");

      if (!hostelId) return;

      try {
        // Check if the group chat exists
        const groupChat = await GroupChat.findOne({ hostelId });

        if (!groupChat) {
          return socket.emit("errorMessage", {
            error: "Group chat does not exist.",
          });
        }

        const newMessageId = new mongoose.Types.ObjectId();

        // Create a new chat message
        const chatMessage = {
          _id: newMessageId, // Assign the generated ID
          sender: userId,
          message: message || "", // Ensure message is always a string
          timestamp: new Date(),
          image: image || null, // Add image if provided
          audio: audioUrl || null,
        };

        // Add the message to the group's chat array
        groupChat.chats.push(chatMessage);
        await groupChat.save();

        // Emit the new message to all users in the group
        // console.log({
        //   message: chatMessage,
        //   sender: { _id: userId, name: senderName },
        // });

        io.to(hostelId).emit("newMessage", {
          message: chatMessage,
          sender: { _id: userId, name: senderName },
        });
      } catch (error) {
        console.error("❌ Error saving chat:", error);
      }
    }
  );

  async function updatePinnedMessage(messageId, hostelId) {
    try {
      // First, find the group chat for the specific hostel
      const groupChat = await GroupChat.findOne({ hostelId });

      if (!groupChat) {
        throw new Error("Group chat not found");
      }

      // Unpin any previously pinned messages
      groupChat.chats.forEach((chat) => {
        if (chat.pinned) {
          chat.pinned = false;
        }
      });

      // Find the specific message and pin it
      const messageToPin = groupChat.chats.find(
        (chat) => chat._id.toString() === messageId
      );

      if (!messageToPin) {
        throw new Error("Message not found");
      }

      // Set the new message as pinned
      messageToPin.pinned = true;

      // Save the updated group chat
      await groupChat.save();
      return messageToPin;
    } catch (error) {
      console.error("Error updating pinned message:", error);
      throw error;
    }
  }
  socket.on("pinMessage", async ({ messageId, hostelId }) => {
    try {
      // Unpin existing message and pin the new one
      const pinnedMessage = await updatePinnedMessage(messageId, hostelId);

      socket.to(hostelId).emit("messagePinned", {
        messageId,
        pinnedMessage,
      });
    } catch (error) {
      // Handle any errors
      socket.emit("pinMessageError", { error: error.message });
    }
  });
  socket.on("unpinMessage", async ({ hostelId }) => {
    try {
      const groupChat = await GroupChat.findOne({ hostelId });

      if (!groupChat) {
        throw new Error("Group chat not found");
      }

      // Unpin any previously pinned messages
      groupChat.chats.forEach((chat) => {
        if (chat.pinned) {
          chat.pinned = false;
        }
      });

      await groupChat.save();
      socket.to(hostelId).emit("messageUnpinned");
    } catch (error) {
      console.error("Error unpinning message:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("deleteMessage", async ({ messageId, hostelId, code, userId }) => {
    try {
      const groupChat = await GroupChat.findOne({ hostelId });

      if (!groupChat) {
        throw new Error("Group chat not found");
      }

      // Filter out the message with the given ID
      groupChat.chats = groupChat.chats.filter(
        (chat) => chat._id.toString() !== messageId
      );
      await groupChat.save();
      socket.to(hostelId).emit("messageDeleted", messageId);
    } catch (error) {
      console.error("Error deleting message:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // console.log("❌ A user disconnected:", socket.id);

    usersMap.forEach((users, hostelId) => {
      const updatedUsers = users.filter((user) => user.socketId !== socket.id);
      usersMap.set(hostelId, updatedUsers);
    });
  });
});

// MongoDB Connection
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed: ", err);
  });

// const handleMarketChatEvents = () => {
//   socket.on("joinChat", ({ buyerId, sellerId }) => {
//     // Create a consistent room name by sorting the IDs
//     const chatRoom = [buyerId, sellerId].sort().join("-");
//     socket.join(chatRoom);
//     console.log(`User joined chat: ${chatRoom}`);
//   });

//   socket.on("join", (userId) => {
//     socket.join(userId); // User joins their own room (userId)
//     console.log(`User ${userId} joined their personal room`);
//   });

//   socket.on("sendMessage", (message) => {
//     const { senderId, receiverId } = message;
//     // Use the same room naming strategy
//     const chatRoom = [senderId, receiverId].sort().join("-");
//     io.to(chatRoom).emit("receiveMessage", message);
//   });
// };

app.use("/api/chat", marketchatRoute(io));
// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/marketplace", marketplaceRoutes);
// app.use("/api/chat", marketchatRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
