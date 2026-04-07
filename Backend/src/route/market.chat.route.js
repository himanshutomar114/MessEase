import express from "express";
import Chat from "../model/market.chat.model.js";
import verifyJwt from "../middleware/auth.middleware.js";

// Factory function that creates and returns the router with socket.io support
const createChatRouter = (io) => {
  const router = express.Router();

  //   // POST /api/chat/create
  // router.post('/create', verifyJwt, async (req, res) => {
  //   try {
  //     const { buyerId, sellerId } = req.body;

  //     // Validate user IDs
  //     if (!buyerId || !sellerId) {
  //       return res.status(400).json({ error: 'Sender and receiver IDs are required' });
  //     }

  //     // Check if chat already exists
  //     let existingChat = await Chat.findOne({
  //       participants: { $all: [buyerId, senderId] }
  //     });

  //     if (existingChat) {
  //       return res.status(200).json(existingChat);
  //     }

  //     // Create new chat
  //     const newChat = new Chat({
  //       participants: [buyerId, senderId],
  //       messages: [],
  //       lastMessage: null,
  //       unreadCount: { [buyerId]: 0, [senderId]: 0 }
  //     });

  //     await newChat.save();

  //     return res.status(201).json(newChat);
  //   } catch (error) {
  //     console.error('Error creating chat:', error);
  //     return res.status(500).json({ error: 'Error creating chat' });
  //   }
  // });

  // // Fetch chat inbox for the logged-in user with unread count calculation
  // router.get("/inbox", verifyJwt, async (req, res) => {
  //   try {
  //     const userId = req.user?._id;
  //     if (!userId) return res.status(400).json({ error: "User ID required" });

  //     const chats = await Chat.find({
  //       $or: [{ buyerId: userId }, { sellerId: userId }],
  //     })
  //       .populate("buyerId", "username")
  //       .populate("sellerId", "username")
  //       .sort({ updatedAt: -1 });

  //     // Calculate unread messages for each chat
  //     const chatSummaries = chats.map((chat) => {
  //       const lastMessage = chat.messages.length > 0
  //         ? chat.messages[chat.messages.length - 1].text
  //         : "No messages yet";

  //       const isUserBuyer = chat.buyerId._id.toString() === userId.toString();
  //       const lastRead = isUserBuyer ? chat.buyerLastRead : chat.sellerLastRead;
  //       const unreadCount = lastRead
  //         ? chat.messages.filter(msg => msg.timestamp > lastRead).length
  //         : chat.messages.length;

  //       return {
  //         _id: chat._id,
  //         buyerId: chat.buyerId._id.toString(),
  //         sellerId: chat.sellerId._id.toString(),
  //         buyer: chat.buyerId,
  //         seller: chat.sellerId,
  //         lastMessage,
  //         unreadCount,
  //       };
  //     });

  //     res.json(chatSummaries);
  //   } catch (error) {
  //     console.error("Error fetching chat inbox:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // Fetch chat inbox for the logged-in user with unread count calculation
  router.get("/inbox", verifyJwt, async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(400).json({ error: "User ID required" });
      console.log(1);
      const chats = await Chat.find({
        $or: [{ buyerId: userId }, { sellerId: userId }],
      })
        .populate("buyerId", "name profilePicture")
        .populate("sellerId", "name profilePicture")
        .sort({ updatedAt: -1 });
      console.log(2);
      // Calculate unread messages for each chat and include last message details
      const chatSummaries = chats.map((chat) => {
        // Get last message data with more details
        const lastMessageData =
          chat.messages.length > 0
            ? {
                text: chat.messages[chat.messages.length - 1].text,
                senderId: chat.messages[chat.messages.length - 1].senderId,
                timestamp: chat.messages[chat.messages.length - 1].timestamp,
              }
            : { text: "No messages yet", senderId: null, timestamp: null };

        const isUserBuyer = chat.buyerId._id.toString() === userId.toString();
        const lastRead = isUserBuyer ? chat.buyerLastRead : chat.sellerLastRead;
        const unreadCount = lastRead
          ? chat.messages.filter((msg) => msg.timestamp > lastRead).length
          : chat.messages.length;

        return {
          _id: chat._id,
          buyerId: chat.buyerId._id.toString(),
          sellerId: chat.sellerId._id.toString(),
          buyer: chat.buyerId,
          seller: chat.sellerId,
          lastMessage: lastMessageData.text,
          lastMessageSenderId: lastMessageData.senderId,
          lastMessageTimestamp: lastMessageData.timestamp,
          unreadCount,
        };
      });

      res.json(chatSummaries);
    } catch (error) {
      console.error("Error fetching chat inbox:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get (or create) a chat between the logged-in user and a seller
  router.get("/:sellerId", verifyJwt, async (req, res) => {
    try {
      console.log(req.user._id);
      const { sellerId } = req.params;
      const userId = req.user?._id;
      console.log("userId", userId);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      console.log(1);
      let chat = await Chat.findOne({
        $or: [
          { buyerId: userId, sellerId: sellerId },
          { buyerId: sellerId, sellerId: userId },
        ],
      });

      // Create new chat if it doesn't exist
      if (!chat) {
        chat = new Chat({
          buyerId: userId,
          sellerId,
          messages: [],
          buyerLastRead: new Date(),
          sellerLastRead: null,
        });
        await chat.save();
      }

      // res.json(chat);
      const formattedChat = {
        ...chat.toObject(),
        messages: chat.messages.map((msg) => ({
          senderId: msg.senderId,
          text: msg.text,
          timestamp: msg.timestamp,
        })),
      };

      res.json(formattedChat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send a new message in a conversation
  router.post("/send", verifyJwt, async (req, res) => {
    try {
      const { chatId, senderId, receiverId, text } = req.body;
      console.log(chatId);
      if (!chatId || !senderId || !receiverId || !text) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const chat = await Chat.findById(chatId);
      console.log(1);
      if (!chat) return res.status(404).json({ error: "Chat not found" });

      const newMessage = {
        senderId,
        text,
        timestamp: new Date(),
      };
      console.log(2);
      chat.messages.push(newMessage);
      await chat.save();

      // Emit socket event to notify the receiver
      io.to(receiverId.toString()).emit("newMessage", {
        chatId,
        senderId,
        text,
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mark the conversation as read for the logged-in user
  router.put("/mark-read", verifyJwt, async (req, res) => {
    try {
      const { chatId } = req.body;
      const userId = req.user?._id;

      if (!chatId || !userId) {
        return res
          .status(400)
          .json({ error: "Chat ID and User ID are required" });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });

      // Update last read timestamp based on user role
      if (chat.buyerId.toString() === userId.toString()) {
        chat.buyerLastRead = new Date();
      } else if (chat.sellerId.toString() === userId.toString()) {
        chat.sellerLastRead = new Date();
      } else {
        return res
          .status(400)
          .json({ error: "User is not a participant in this chat" });
      }

      await chat.save();
      res.json({ success: true, chat });
    } catch (error) {
      console.error("Error marking chat as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};

export default createChatRouter;
