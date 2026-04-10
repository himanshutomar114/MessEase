import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import useHostelCheck from "../../hooks/useHostelCheck";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();
  const isBlocked = useSelector((state) => state.auth.isBlocked);

  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  useEffect(() => {
    // Load from localStorage or use mock data
    const storedNotifications = localStorage.getItem("studentNotifications");
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Error parsing stored notifications", err);
      }
    }

    // Simulate loading notifications
    const mockNotifications = [
      {
        id: 1,
        type: "election",
        title: "New Election Started",
        description: "Hostel Manager election is now open for voting",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        icon: "🗳️",
        color: "blue",
        read: false,
      },
      {
        id: 2,
        type: "fees",
        title: "Fee Payment Due",
        description: "Hostel fees for March 2026 are due by March 15th",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: "💳",
        color: "amber",
        read: false,
      },
      {
        id: 3,
        type: "mess",
        title: "Mess Menu Updated",
        description: "New menu for next week has been posted",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        icon: "🍽️",
        color: "green",
        read: true,
      },
      {
        id: 4,
        type: "guest",
        title: "Guest Room Approved",
        description: "Your guest room booking for March 10-12 has been approved",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        icon: "🏠",
        color: "purple",
        read: true,
      },
      {
        id: 5,
        type: "complaint",
        title: "Complaint Resolved",
        description: "Your water supply complaint has been resolved",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        icon: "✅",
        color: "green",
        read: true,
      },
      {
        id: 6,
        type: "election",
        title: "Election Results Announced",
        description: "President election results are now available",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: "📊",
        color: "yellow",
        read: true,
      },
    ];
    setNotifications(mockNotifications);
    localStorage.setItem("studentNotifications", JSON.stringify(mockNotifications));
    setLoading(false);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const markAsRead = (id) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notif) => ({ ...notif, read: true }));
    setNotifications(updated);
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((notif) => notif.id !== id);
    setNotifications(updated);
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading || loadingCheck) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
            <p className="text-indigo-300 animate-pulse">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto p-6 pt-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? (
                <span>
                  You have{" "}
                  <span className="text-indigo-400 font-semibold">
                    {unreadCount}
                  </span>{" "}
                  unread notification{unreadCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-green-400">All caught up!</span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 text-sm font-semibold"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-gray-800 p-12 rounded-xl shadow-lg border border-gray-700 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-gray-400 text-lg">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-xl shadow-lg border transition-all duration-300 cursor-pointer ${
                  notification.read
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-indigo-900 bg-opacity-30 border-indigo-600 border-opacity-50 hover:border-indigo-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl mt-1">{notification.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/student/home")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
