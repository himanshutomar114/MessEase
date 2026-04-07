import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../../utils/axiosRequest";
import { io } from "socket.io-client";
import {
  Send,
  MessageCircle,
  Image as ImageIcon,
  Pin,
  Trash2,
  Star,
  BarChart2,
  X,
  StopCircle,
  Mic,
  ChevronUp,
} from "lucide-react";
import Header from "../../components/Header";
import AdminHeader from "../../components/AdminHeader";
import { useSelector } from "react-redux";
import { serverUrl } from "../../utils/constants";
import useHostelCheck from "../../hooks/useHostelCheck";

// Replace this with the specific user ID that should have pinning privileges
// const PINNING_ALLOWED_USER_ID = "admin_user_id_here";

const SERVER_URL = serverUrl || "http://localhost:4001"; // Update this to your server URL

const socket = io(SERVER_URL);

export const GroupChat = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { user: reduxUser } = useSelector((state) => state.auth);
  const { code } = useParams();
  const location = useLocation();
  const hostelId = reduxUser.hostel || location.state.hostelId || "";
  const userId = reduxUser._id || "";
  const userName = reduxUser.name || " ";
  const role = reduxUser.role;
  const PINNING_ALLOWED_USER_ID =
    role == "messManager" || role == "hostelManager";
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);

  // Poll States
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [activePoll, setActivePoll] = useState(null);
  const [userVote, setUserVote] = useState(null);

  // Create a ref for the chat messages container
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [created, setCreated] = useState(true);

  //
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // First, let's create a state to track the preview area height
  const [previewHeight, setPreviewHeight] = useState(0);
  const previewRef = useRef(null);
  const { loadingCheck } = useHostelCheck();

  // Add useEffect to measure the preview height when it changes
  useEffect(() => {
    if (previewRef.current) {
      setPreviewHeight(previewRef.current.offsetHeight);
    } else {
      setPreviewHeight(0);
    }
  }, [imagePreview, audioPreview]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPage, setTotalPage] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioFile(audioBlob);
        setAudioPreview(audioUrl);

        // Stop all tracks from the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Check if current user has pinning privileges
  const canPin = PINNING_ALLOWED_USER_ID;
  useEffect(() => {
    // Permanently add dark mode class
    document.documentElement.classList.add("dark");

    // Cleanup to remove dark mode class when component unmounts
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom smoothly whenever chats change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats]);

  useEffect(() => {
    // Join the chat room when component mounts
    if (hostelId && userId) {
      socket.emit("joinRoom", { hostelId, userId });
    }
    // Fetch initial chats
    const fetchChats = async () => {
      try {
        const response = await api.get("/api/admin/getChats", {
          params: { hostelId, code, page },
        });
        setTotalPage(response.data.totalPages);
        const pV = page;
        if (response.data.chats.length > 0) setPage(page + 1);

        if (pV == response.data.totalPages) setHasMore(false);
        else {
          setTotalPage(response.data.totalPages);
          setHasMore(true);
        }

        console.log(response.data.totalPages);
        console.log("ALL CHATS: ", response.data); // data.chats.sender.pinned
        setChats(response.data.chats);

        // Check for any starred messages in local storage
        const savedStarredMessages = localStorage.getItem(
          `starredMessages-${hostelId}-${userId}`
        );
        if (savedStarredMessages) {
          try {
            const parsed = JSON.parse(savedStarredMessages);
            setStarredMessages(parsed);
          } catch (error) {
            console.error(
              "Error parsing starred messages from local storage:",
              error
            );
            setStarredMessages([]);
          }
        }

        // Check for any active poll in local storage
        const savedActivePoll = localStorage.getItem(`activePoll-${hostelId}`);
        if (savedActivePoll) {
          try {
            const parsed = JSON.parse(savedActivePoll);
            setActivePoll(parsed);

            // Check if current user has already voted
            const userVotes = localStorage.getItem(
              `pollVotes-${hostelId}-${parsed.id}`
            );
            if (userVotes) {
              const votesMap = JSON.parse(userVotes);
              if (votesMap[userId]) {
                setUserVote(votesMap[userId]);
              }
            }
          } catch (error) {
            console.error(
              "Error parsing active poll from local storage:",
              error
            );
          }
        }
      } catch (error) {
        if (!error.response.data.groupChat) {
          setCreated(false);
        }
        console.log("Error fetching chats:", error);
      }
    };
    fetchChats();

    // Listen for new messages
    socket.on("newMessage", ({ message, sender }) => {
      setChats((prevChats) => {
        console.log("Before update:", prevChats);
        const updatedChats = [...prevChats, { ...message, sender }];
        console.log("After update:", updatedChats);
        return updatedChats;
      });
    });

    // Listen for pinned messages
    socket.on("messagePinned", ({ messageId, pinnedMessage }) => {
      console.log("Pinned Message ID:", { messageId, pinnedMessage });

      setChats((prevChats) => {
        console.log("Previous Chats:", prevChats);

        const updatedChats = prevChats.map((chat) => ({
          ...chat,
          pinned: chat._id === messageId,
        }));

        console.log("Updated Chats:", updatedChats);
        return updatedChats;
      });
    });

    // Listen for unpinned messages
    socket.on("messageUnpinned", () => {
      setChats((prevChats) => {
        console.log("Previous Chats sender:", prevChats);

        const updatedChats = prevChats.map((chat) => ({
          ...chat,
          pinned: false,
        }));

        console.log("Updated Chats sender:", updatedChats);
        return updatedChats;
      });
    });

    // Listen for deleted messages
    socket.on("messageDeleted", (messageId) => {
      console.log("Message deleted:", messageId);
      const wasMessagePinned = chats.some(
        (chat) => chat._id === messageId && chat.pinned
      );

      if (wasMessagePinned) {
        setChats((prevChats) => {
          console.log("Previous Chats sender:", prevChats);

          const updatedChats = prevChats.map((chat) => ({
            ...chat,
            pinned: false,
          }));

          console.log("Updated Chats sender:", updatedChats);
          return updatedChats;
        });
      }

      // Also remove from starred messages if it was starred
      setStarredMessages((prev) => {
        const updated = prev.filter((msg) => msg._id !== messageId);
        // Update localStorage with the new starred messages
        localStorage.setItem(
          `starredMessages-${hostelId}-${userId}`,
          JSON.stringify(updated)
        );
        return updated;
      });

      setChats((prevChats) => {
        const updatedChats = prevChats.filter((chat) => {
          return chat._id !== messageId;
        });
        return updatedChats;
      });
    });

    // Listen for new poll
    socket.on("newPoll", (poll) => {
      console.log("New poll received:", poll);
      setActivePoll(poll);
      localStorage.setItem(`activePoll-${hostelId}`, JSON.stringify(poll));
      // Reset user vote since this is a new poll
      setUserVote(null);
    });

    // Listen for poll votes
    socket.on("pollVoteUpdated", (updatedPoll) => {
      console.log("Poll vote updated:", updatedPoll);
      setActivePoll(updatedPoll);
      localStorage.setItem(
        `activePoll-${hostelId}`,
        JSON.stringify(updatedPoll)
      );
    });

    // Listen for poll ended
    socket.on("pollEnded", () => {
      console.log("Poll has ended");
      setActivePoll(null);
      setUserVote(null);
      localStorage.removeItem(`activePoll-${hostelId}`);
      // Could also send a system message that the poll has ended
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagePinned");
      socket.off("messageUnpinned");
      socket.off("messageDeleted");
      socket.off("newPoll");
      socket.off("pollVoteUpdated");
      socket.off("pollEnded");
    };
  }, [hostelId, userId]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image preview
  const clearImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const clearAudioPreview = () => {
    setAudioFile(null);
    setAudioPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Pin a message
  const pinMessage = (chat) => {
    const message = chat;
    console.log(message, canPin);
    console.log(message._id);
    // Only allow pinning if user has privileges
    if (!canPin) return;

    try {
      // Emit pin message event to server
      socket.emit("pinMessage", {
        messageId: message._id,
        hostelId,
        code,
        pinnedBy: userId,
      });

      // Update local state to mark this message as pinned
      setChats((prevChats) => {
        console.log("Previous Chats sender:", prevChats);

        const updatedChats = prevChats.map((chat) => ({
          ...chat,
          pinned: chat._id === message._id,
        }));

        console.log("Updated Chats sender:", updatedChats);
        return updatedChats;
      });
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const getMoreChats = async () => {
    try {
      const response = await api.get("/api/admin/getChats", {
        params: { hostelId, code, page },
      });
      const pV = page;
      if (response.data.chats.length > 0) {
        setChats((prev) => [...response.data.chats, ...prev]); // Add at the beginning
        setPage(page + 1);
      } else {
        setHasMore(false); // No more chats to load
      }

      if (pV == response.data.totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setTotalPage(response.data.totalPages);
      }
      // Check for any starred messages in local storage
      const savedStarredMessages = localStorage.getItem(
        `starredMessages-${hostelId}-${userId}`
      );
      if (savedStarredMessages) {
        try {
          const parsed = JSON.parse(savedStarredMessages);
          setStarredMessages(parsed);
        } catch (error) {
          console.error(
            "Error parsing starred messages from local storage:",
            error
          );
          setStarredMessages([]);
        }
      }

      // Check for any active poll in local storage
      const savedActivePoll = localStorage.getItem(`activePoll-${hostelId}`);
      if (savedActivePoll) {
        try {
          const parsed = JSON.parse(savedActivePoll);
          setActivePoll(parsed);

          // Check if current user has already voted
          const userVotes = localStorage.getItem(
            `pollVotes-${hostelId}-${parsed.id}`
          );
          if (userVotes) {
            const votesMap = JSON.parse(userVotes);
            if (votesMap[userId]) {
              setUserVote(votesMap[userId]);
            }
          }
        } catch (error) {
          console.error("Error parsing active poll from local storage:", error);
        }
      }
    } catch (error) {
      console.log(error.message);
      console.error("Error fetching chats:", error);
    }
  };
  // Star a message
  const starMessage = (chat) => {
    const isAlreadyStarred = starredMessages.some(
      (msg) => msg._id === chat._id
    );

    if (isAlreadyStarred) {
      // Remove from starred
      const updatedStarred = starredMessages.filter(
        (msg) => msg._id !== chat._id
      );
      setStarredMessages(updatedStarred);
      // Save to localStorage
      localStorage.setItem(
        `starredMessages-${hostelId}-${userId}`,
        JSON.stringify(updatedStarred)
      );
    } else {
      // Add to starred
      const updatedStarred = [...starredMessages, chat];
      setStarredMessages(updatedStarred);
      // Save to localStorage
      localStorage.setItem(
        `starredMessages-${hostelId}-${userId}`,
        JSON.stringify(updatedStarred)
      );
    }
  };

  // Unpin the current pinned message
  const unpinMessage = () => {
    // Only allow unpinning if user has privileges
    if (!canPin) return;

    try {
      // Emit unpin message event to server
      socket.emit("unpinMessage", {
        hostelId,
        code,
      });

      // Remove pin from all messages
      setChats((prevChats) => {
        console.log("Previous Chats sender:", prevChats);

        const updatedChats = prevChats.map((chat) => ({
          ...chat,
          pinned: false,
        }));

        console.log("Updated Chats sender:", updatedChats);
        return updatedChats;
      });
    } catch (error) {
      console.error("Error unpinning message:", error);
    }
  };

  // Delete a message
  const deleteMessage = (messageId) => {
    try {
      console.log({ messageId, hostelId, code, userId });
      // Emit delete message event to server
      socket.emit("deleteMessage", {
        messageId,
        hostelId,
        code,
        userId, // Include userId to verify message ownership on server
      });

      // Optimistically update UI
      setChats((prevChats) => {
        return prevChats.filter((chat) => chat._id !== messageId);
      });

      // Also remove from starred messages if it was starred
      setStarredMessages((prev) => {
        const updated = prev.filter((msg) => msg._id !== messageId);
        // Update localStorage with the new starred messages
        localStorage.setItem(
          `starredMessages-${hostelId}-${userId}`,
          JSON.stringify(updated)
        );
        return updated;
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    try {
      // Prepare base message object
      const chatMessage = {
        userId,
        hostelId,
        code, // also need messageId
        senderName: userName,
        message: message.trim(),
      };
      console.log("NM: ", chatMessage);

      // Handle image upload if exists
      if (imageFile) {
        console.log("IMAGES");
        // Create FormData for image upload
        const formData = new FormData();
        formData.append("chatImage", imageFile);
        formData.append("userId", userId);
        formData.append("hostelId", hostelId);
        formData.append("code", code);
        formData.append("senderName", userName);
        console.log(imageFile);
        console.log([...formData.entries()]);
        // Upload image to server
        const uploadResponse = await api.post(
          "/api/admin/uploadImage",
          formData
        );
        console.log(uploadResponse.data.imageUrl);
        // If image upload is successful, use the returned image URL
        if (uploadResponse.data.imageUrl) {
          chatMessage.image = uploadResponse.data.imageUrl;
        }
      }
      if (audioFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("hostelId", hostelId);
        formData.append("code", code);
        formData.append("senderName", userName);

        const fileName = Math.random().toString(36).substring(2, 15) + ".mp3"; // Generate a random filename

        const newAudioFile = new File([audioFile], fileName, {
          type: audioFile.type,
        }); // Create a new File with correct name

        formData.append("chatAudio", newAudioFile);

        console.log(fileName);
        console.log(newAudioFile);
        console.log([...formData.entries()]);
        // Upload image to server
        const uploadResponse = await api.post(
          "/api/admin/uploadAudio",
          formData
        );
        console.log("AUDIO RETURN : ", uploadResponse.data);

        console.log(uploadResponse.data.audioUrl);
        // If image upload is successful, use the returned image URL
        if (uploadResponse.data.audioUrl) {
          chatMessage.audioUrl = uploadResponse.data.audioUrl;
        }
      }

      // Emit message to socket
      socket.emit("sendMessage", chatMessage);

      // Reset form
      setMessage("");
      clearImagePreview();
      clearAudioPreview();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Toggle starred messages sidebar
  const toggleStarredMessages = () => {
    setShowStarredMessages(!showStarredMessages);
  };

  // Clear all starred messages
  const clearAllStarredMessages = () => {
    setStarredMessages([]);
    localStorage.setItem(
      `starredMessages-${hostelId}-${userId}`,
      JSON.stringify([])
    );
  };

  // Check if a message is starred
  const isMessageStarred = (messageId) => {
    return starredMessages.some((msg) => msg._id === messageId);
  };

  // Toggle poll creator modal
  const togglePollCreator = () => {
    setShowPollCreator(!showPollCreator);
    // Reset form when opening
    if (!showPollCreator) {
      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
    }
  };

  // Handle poll option changes
  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Create a new poll
  const createPoll = () => {
    // Validate inputs
    if (!pollQuestion.trim()) {
      alert("Please enter a poll question");
      return;
    }

    // Check that at least 2 options are filled
    const filledOptions = pollOptions.filter((option) => option.trim() !== "");
    if (filledOptions.length < 2) {
      alert("Please enter at least 2 options");
      return;
    }

    // Create poll object
    const newPoll = {
      id: Date.now().toString(), // Simple unique ID
      question: pollQuestion.trim(),
      options: pollOptions.filter((option) => option.trim() !== ""),
      createdBy: userId,
      createdByName: userName,
      votes: {}, // Will store option index -> count
      voters: {}, // Will store userId -> option index
    };

    // Initialize vote counts
    newPoll.options.forEach((_, index) => {
      newPoll.votes[index] = 0;
    });

    // Emit poll creation to server
    socket.emit("createPoll", {
      poll: newPoll,
      hostelId,
      code,
    });

    // Update local state
    setActivePoll(newPoll);
    localStorage.setItem(`activePoll-${hostelId}`, JSON.stringify(newPoll));

    // Close the poll creator
    setShowPollCreator(false);

    // Announce poll creation in chat
    const pollMessage = {
      userId,
      hostelId,
      code,
      senderName: userName,
      message: `📊 I've started a new poll: "${pollQuestion}"`,
    };
    socket.emit("sendMessage", pollMessage);
  };

  // Handle voting on a poll
  const voteOnPoll = (optionIndex) => {
    if (!activePoll || userVote !== null) return;

    // Create a copy of the active poll
    const updatedPoll = { ...activePoll };

    // Update vote counts
    updatedPoll.votes[optionIndex] = (updatedPoll.votes[optionIndex] || 0) + 1;
    updatedPoll.voters[userId] = optionIndex;

    // Emit vote to server
    socket.emit("votePoll", {
      pollId: updatedPoll.id,
      userId,
      optionIndex,
      hostelId,
      code,
    });

    // Update local state
    setActivePoll(updatedPoll);
    setUserVote(optionIndex);

    // Store in localStorage to track user's vote
    const votesKey = `pollVotes-${hostelId}-${updatedPoll.id}`;
    let votesMap = {};
    const existingVotes = localStorage.getItem(votesKey);
    if (existingVotes) {
      votesMap = JSON.parse(existingVotes);
    }
    votesMap[userId] = optionIndex;
    localStorage.setItem(votesKey, JSON.stringify(votesMap));
    localStorage.setItem(`activePoll-${hostelId}`, JSON.stringify(updatedPoll));
  };

  // End the active poll
  const endPoll = () => {
    if (!activePoll || activePoll.createdBy !== userId) return;

    // Emit poll end to server
    socket.emit("endPoll", {
      pollId: activePoll.id,
      hostelId,
      code,
    });

    // Clear local state
    setActivePoll(null);
    setUserVote(null);
    localStorage.removeItem(`activePoll-${hostelId}`);
    localStorage.removeItem(`pollVotes-${hostelId}-${activePoll.id}`);

    // Announce poll ending in chat
    const winningOptions = [];
    let maxVotes = 0;

    // Find the option(s) with the most votes
    Object.entries(activePoll.votes).forEach(([index, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winningOptions.length = 0;
        winningOptions.push(parseInt(index));
      } else if (count === maxVotes) {
        winningOptions.push(parseInt(index));
      }
    });

    // Calculate total votes
    const totalVotes = Object.values(activePoll.votes).reduce(
      (sum, count) => sum + count,
      0
    );

    // Create result message
    let resultMessage = `📊 Poll ended: "${activePoll.question}"\n`;
    resultMessage += `Total votes: ${totalVotes}\n`;

    if (totalVotes === 0) {
      resultMessage += "No votes were cast.";
    } else {
      resultMessage += "Results:\n";
      activePoll.options.forEach((option, index) => {
        const count = activePoll.votes[index] || 0;
        const percentage =
          totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isWinner = winningOptions.includes(index);
        resultMessage += `${option}: ${count} votes (${percentage}%)${isWinner ? " 🏆" : ""}\n`;
      });
    }

    // Send the result message
    const pollMessage = {
      userId,
      hostelId,
      code,
      senderName: userName,
      message: resultMessage,
    };
    socket.emit("sendMessage", pollMessage);
  };

  // Find the pinned message
  const pinnedMessage = chats.find((chat) => chat.pinned);

  // Calculate poll statistics
  const calculatePollStats = () => {
    if (!activePoll) return null;

    const totalVotes = Object.values(activePoll.votes).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalVotes,
      percentages: activePoll.options.map((_, index) => {
        const count = activePoll.votes[index] || 0;
        return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      }),
    };
  };

  const pollStats = calculatePollStats();

  if (!created) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col transition-colors duration-300">
        <Header />
        <div className="container p-4 flex w-4/5 mx-auto">
          <div className="bg-gray-800 shadow-md rounded-lg w-full p-4">
            <h1 className="text-2xl text-center text-red-500">
              Group Chat Not Created
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-900 flex flex-col transition-colors duration-300">
        {reduxUser?.role === "admin" ? <AdminHeader /> : <Header />}
        <div className="container p-4 flex w-4/5 mx-auto">
          {/* Main Chat Panel */}
          <div
            className={`bg-gray-800 shadow-md rounded-lg ${showStarredMessages ? "w-2/3" : "w-full"} ${showStarredMessages ? "mr-4" : ""}`}
          >
            <div className="flex items-center mb-4 border-b border-gray-700 pb-2 px-4 pt-4">
              <MessageCircle className="w-8 h-8 text-blue-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-200">Group Chat</h2>
              <div className="ml-auto flex items-center space-x-4">
                <button
                  onClick={togglePollCreator}
                  className="flex items-center text-blue-400 hover:text-blue-500"
                  disabled={activePoll !== null}
                  title={
                    activePoll ? "A poll is already active" : "Create a poll"
                  }
                >
                  <BarChart2 className="w-5 h-5 mr-1" />
                  <span className="text-sm">Poll</span>
                </button>
                <button
                  onClick={toggleStarredMessages}
                  className="flex items-center text-yellow-400 hover:text-yellow-500"
                >
                  <Star
                    className="w-5 h-5 mr-1"
                    fill={showStarredMessages ? "#FBBF24" : "none"}
                  />
                  <span className="text-sm">
                    {showStarredMessages ? "Hide Starred" : "Show Starred"}
                  </span>
                </button>
              </div>
            </div>

            {hasMore && (
              <div className="px-4 mb-2">
                <button
                  onClick={getMoreChats}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-md flex items-center justify-center transition-colors"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Load More Messages
                </button>
              </div>
            )}
            {/* Pinned Message Section */}
            {pinnedMessage && (
              <div className="mb-4 bg-yellow-900 bg-opacity-30 p-2 rounded-md relative mx-4">
                <div className="flex items-center mb-1">
                  <Pin className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-300">
                    Pinned Message
                  </span>
                  {canPin && (
                    <button
                      onClick={unpinMessage}
                      className="ml-auto text-sm text-red-400 hover:text-red-500"
                    >
                      Unpin
                    </button>
                  )}
                </div>
                <div className="flex">
                  <div className="flex-grow">
                    <strong className="block text-sm text-gray-300 mb-1">
                      {pinnedMessage.sender._id === userId
                        ? "You"
                        : pinnedMessage.sender.name}
                    </strong>
                    {pinnedMessage.message && (
                      <p className="text-gray-200">{pinnedMessage.message}</p>
                    )}
                    {pinnedMessage.image && (
                      <img
                        src={pinnedMessage.image}
                        alt="Pinned image"
                        className="max-w-full h-auto rounded-md mt-2"
                      />
                    )}
                    {pinnedMessage.audio && (
                      <div className="mt-2">
                        <audio controls className="w-96">
                          <source src={pinnedMessage.audio} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Active Poll Display */}
            {activePoll && (
              <div className="mb-4 bg-blue-900 bg-opacity-30 p-4 rounded-md relative mx-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BarChart2 className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-md font-medium text-blue-300">
                      Active Poll
                    </span>
                  </div>
                  {activePoll.createdBy === userId && (
                    <button
                      onClick={endPoll}
                      className="text-sm text-red-400 hover:text-red-500 flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      End Poll
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-200 mb-1">
                    {activePoll.question}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Started by{" "}
                    {activePoll.createdBy === userId
                      ? "you"
                      : activePoll.createdByName}{" "}
                    • {pollStats.totalVotes} vote
                    {pollStats.totalVotes !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-2">
                  {activePoll.options.map((option, index) => {
                    const isSelected = userVote === index;
                    const percentage = pollStats.percentages[index];

                    return (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-md transition-all ${
                          isSelected
                            ? "bg-blue-600"
                            : userVote !== null
                              ? "bg-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (userVote === null) {
                            voteOnPoll(index);
                          }
                        }}
                      >
                        {/* Progress bar background */}
                        {userVote !== null && (
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-800 bg-opacity-50 z-0"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        )}

                        {/* Option text and percentage */}
                        <div className="relative z-10 flex justify-between items-center p-2">
                          <span className={`${isSelected ? "font-bold" : ""}`}>
                            {isSelected && "✓ "}
                            {option}
                          </span>
                          {userVote !== null && (
                            <span className="text-sm font-medium">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              ref={chatContainerRef}
              className="overflow-y-auto scroll-smooth px-4"
              style={{
                maxHeight: `calc(390px - ${previewHeight}px)`,
                height: `calc(390px - ${previewHeight}px)`,
                transition: "height 0.2s ease-in-out",
              }}
            >
              {chats.length === 0 ? (
                <p className="text-center text-gray-400 italic">
                  No messages yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {chats.map((chat, index) => {
                    const isStarred = isMessageStarred(chat._id);
                    return (
                      <li
                        key={index}
                        className={`p-2 rounded-md flex ${
                          chat.sender._id === userId
                            ? "justify-end"
                            : "justify-start"
                        } `}
                      >
                        <div
                          className={`max-w-[80%] ${
                            chat.sender._id === userId
                              ? "bg-blue-900 text-right"
                              : "bg-gray-700 text-left"
                          } p-2 rounded-md relative group`}
                        >
                          <strong className="block text-sm text-gray-300 mb-1">
                            {chat.sender._id === userId
                              ? "You"
                              : chat.sender.name}
                          </strong>
                          {chat.message && <p>{chat.message}</p>}
                          {chat.image && (
                            <img
                              src={chat.image}
                              alt="Sent image"
                              className="max-w-full h-auto rounded-md mt-2"
                            />
                          )}
                          {/* Audio file rendering */}
                          {chat.audio && (
                            <div className="mt-2">
                              <audio controls className="w-96">
                                <source src={chat.audio} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                          {/* Message action buttons container */}
                          <div className="absolute top-1 right-1 flex space-x-1">
                            {/* Delete button - only for user's own messages */}
                            {(canPin || chat.sender._id === userId) && (
                              <button
                                onClick={() => deleteMessage(chat._id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {/* Star button for any user - now with filled star when active */}
                            <button
                              onClick={() => starMessage(chat)}
                              className={`${
                                isStarred
                                  ? "text-yellow-400"
                                  : "text-gray-400 hover:text-yellow-400"
                              } ${isStarred ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                              title={
                                isStarred ? "Unstar message" : "Star message"
                              }
                            >
                              <Star
                                className="w-4 h-4"
                                fill={isStarred ? "#FBBF24" : "none"}
                              />
                            </button>
                            {/* Pin button only for authorized user */}
                            {canPin && (
                              <button
                                onClick={() => pinMessage(chat)}
                                className="text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Pin message"
                              >
                                <Pin className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Form for sending messages */}
            <form
              onSubmit={sendMessage}
              className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg shadow-inner"
            >
              {/* Media previews */}
              <div
                ref={previewRef}
                className="flex flex-wrap gap-2"
                style={{
                  marginBottom: previewHeight > 0 ? "0.75rem" : "0",
                }}
              >
                {imagePreview && (
                  <div className="relative inline-block group">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="h-16 sm:h-20 rounded-md border border-gray-600 shadow-md hover:opacity-90 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={clearImagePreview}
                      className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 shadow-lg transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                {audioPreview && (
                  <div className="relative inline-block w-full sm:w-auto">
                    <audio
                      src={audioPreview}
                      controls
                      className="h-10 w-full sm:w-auto rounded-md border border-gray-600 bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={clearAudioPreview}
                      className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 shadow-lg transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center bg-gray-700 rounded-lg overflow-hidden ring-1 ring-gray-600 focus-within:ring-blue-500 shadow-md">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow w-full bg-transparent text-gray-200 p-2 sm:p-3 focus:outline-none placeholder-gray-400"
                />

                <div className="flex items-center justify-start w-full sm:w-auto sm:justify-between sm:border-l border-gray-600">
                  <label className="p-2 sm:p-3 cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <ImageIcon className="w-5 h-5 text-gray-300 hover:text-blue-400 transition-colors" />
                  </label>

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 sm:p-3 cursor-pointer hover:bg-gray-600 transition-all ${
                      isRecording
                        ? "text-red-500 animate-pulse"
                        : "text-gray-300 hover:text-blue-400"
                    }`}
                  >
                    {isRecording ? (
                      <StopCircle className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={message.trim() === "" && !imageFile && !audioFile}
                    className="bg-blue-600 p-2 sm:p-3 hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:text-gray-400 text-white w-12 sm:w-auto rounded-lg flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Starred Messages Sidebar */}
          {showStarredMessages && (
            <div className="w-1/3 bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <Star
                    className="w-5 h-5 text-yellow-400 mr-2"
                    fill="#FBBF24"
                  />
                  <h3 className="text-xl font-bold text-gray-200">
                    Starred Messages
                  </h3>
                </div>
                <button
                  onClick={clearAllStarredMessages}
                  className="text-sm text-red-400 hover:text-red-500"
                  disabled={starredMessages.length === 0}
                >
                  Clear All
                </button>
              </div>

              <div className="overflow-y-auto max-h-[570px] p-4">
                {starredMessages.length === 0 ? (
                  <p className="text-center text-gray-400 italic">
                    No starred messages.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {starredMessages.map((msg, index) => (
                      <li
                        key={index}
                        className="bg-gray-700 p-3 rounded-md relative group"
                      >
                        <strong className="block text-sm text-gray-300 mb-1">
                          {msg.sender._id === userId ? "You" : msg.sender.name}
                        </strong>
                        {msg.message && (
                          <p className="text-gray-200">{msg.message}</p>
                        )}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Starred image"
                            className="max-w-full h-auto rounded-md mt-2"
                          />
                        )}
                        <button
                          onClick={() => starMessage(msg)}
                          className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-500"
                          title="Unstar message"
                        >
                          <Star className="w-4 h-4" fill="#FBBF24" />
                        </button>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Poll Creator Modal */}
        {showPollCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-200">
                  Create a Poll
                </h3>
                <button
                  onClick={togglePollCreator}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full bg-gray-700 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Options</label>
                {pollOptions.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handlePollOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="w-full bg-gray-700 text-gray-200 p-2 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={createPoll}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
