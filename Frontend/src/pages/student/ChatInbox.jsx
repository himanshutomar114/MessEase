import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/axiosRequest";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

const ChatInbox = () => {
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchChats = async () => {
      try {
        const response = await api.get(`/api/chat/inbox`, {
          withCredentials: true,
        });
        setChats(response.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching chat inbox:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (chats.length === 0)
    return (
      <div>
        <Header />
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
          <p className="text-gray-400">You have no chats yet.</p>
          <Link
            to="/marketplace"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );

  return (
    <div>
      <Header />
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Chat Inbox</h2>
        <div className="space-y-4">
          {chats
            .filter(
              (chat) => !(chat.buyerId === userId && chat.sellerId === userId)
            )
            .map((chat) => {
              const otherParty =
                chat.buyerId === userId ? chat.seller : chat.buyer;
              // Fallback image in case profilePicture is missing.
              const profileImage =
                otherParty.profilePicture || "https://via.placeholder.com/40";

              return (
                <Link
                  to={`/chat/${otherParty._id}`}
                  key={chat._id}
                  className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={profileImage}
                      alt={`${otherParty.name} Profile`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="text-xl font-semibold">{otherParty.name}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 rounded-full px-3 py-1 text-sm">
                      {chat.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ChatInbox;

// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import api from "../../utils/axiosRequest";
// import { Link } from "react-router-dom";
// import Header from "../../components/Header";
// import { io } from "socket.io-client";

// const ChatInbox = () => {
//   const user = useSelector((state) => state.auth.user);
//   const userId = user?._id;
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
// const SERVER_URL="localhost:5173"; // Replace with your server URL
// useEffect(() => {
//   if (!userId) return;
//   const fetchChats = async () => {
//     try {
//       const response = await api.get(`/api/chat/inbox?userId=${userId}`, {
//         withCredentials: true,
//       });
//       setChats(response.data);
//     } catch (error) {
//       console.error("Error fetching chat inbox:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchChats();
// }, [userId]);

// In your ChatInbox.jsx component
// useEffect(() => {
//   if (!userId) return;
//   const fetchChats = async () => {
//     try {
//       const response = await api.get(`/api/chat/inbox`, {
//         withCredentials: true,
//       });
//       setChats(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching chat inbox:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchChats();

//   // Set up a socket listener to update inbox in real-time
//   const socket = io(SERVER_URL, { withCredentials: true });
//   socket.on("receiveMessage", (message) => {
//     // Update the chats list when new messages arrive
//     fetchChats();
//   });

//   return () => {
//     if (socket) socket.disconnect();
//   };
// }, [userId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-gray-100">
//         <Header />
//         <div className="flex justify-center items-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (chats.length === 0)
//     return (
//       <div>
//         <Header />
//         <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900">
//           <p className="text-gray-400">You have no chats yet.</p>
//           <Link
//             to="/marketplace"
//             className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           >
//             Back to Marketplace
//           </Link>
//         </div>
//       </div>
//     );

//   return (
//     <div>
//       <Header />
//       <div className="p-6 bg-gray-900 min-h-screen text-white">
//         <h2 className="text-3xl font-bold mb-6 text-center">Chat Inbox</h2>
//         <div className="max-w-3xl mx-auto space-y-4">
//           {chats.map((chat) => {
//             // Determine the other party in the chat
//             const otherParty =
//               chat.buyerId === userId ? chat.seller : chat.buyer;
//             const isSeller = chat.sellerId === userId;
//             const userRole = isSeller ? "Seller" : "Buyer";
//             const otherRole = isSeller ? "Buyer" : "Seller";

//             return (
//               <Link
//                 to={`/chat/${otherParty._id}`}
//                 key={chat._id}
//                 className="bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors block"
//               >
//                 <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-4">
//                       {otherParty.name}
//                     </div>
//                     <div>
//                       <p className="text-xl font-semibold">{otherParty.name}</p>
//                       <p className="text-sm text-gray-400">{otherRole}</p>
//                     </div>
//                   </div>
//                   {chat.unreadCount > 0 && (
//                     <span className="bg-red-500 rounded-full px-3 py-1 text-sm">
//                       {chat.unreadCount}
//                     </span>
//                   )}
//                 </div>
//                 <div className="p-4">
//                   <div className="flex justify-between items-center">
//                     <p className="text-gray-300 truncate pr-4">
//                       {chat.lastMessage.length > 50
//                         ? chat.lastMessage.substring(0, 50) + "..."
//                         : chat.lastMessage}
//                     </p>
//                     {chat.lastMessageSenderId === userId ? (
//                       <span className="text-xs bg-gray-700 px-2 py-1 rounded">You</span>
//                     ) : (
//                       <span className="text-xs bg-blue-600 px-2 py-1 rounded">
//                         {otherParty.name}
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex justify-between mt-2 text-xs text-gray-400">
//                     <span>
//                       {chat.lastMessageTimestamp ? new Date(chat.lastMessageTimestamp).toLocaleString() : "No messages yet"}
//                     </span>
//                     <span>Your role: {userRole}</span>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInbox;
