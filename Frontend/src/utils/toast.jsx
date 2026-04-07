import toast, { Toaster } from "react-hot-toast";
import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// Custom toast component
export const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={true}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        className: "custom-toast",
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
          border: "1px solid #444",
          padding: "12px 16px",
          maxWidth: "350px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
          borderLeft: "4px solid #666", // Default left border
        },
        // Success toast specific styling
        success: {
          style: {
            background: "#222",
            color: "#4caf50",
            border: "1px solid #444",
            borderLeft: "4px solid #4caf50", // Success left border
          },
        },
        // Error toast specific styling
        error: {
          style: {
            background: "#222",
            color: "#f44336",
            border: "1px solid #444",
            borderLeft: "4px solid #f44336", // Error left border
          },
        },
        // Warning toast specific styling
        warning: {
          style: {
            background: "#222",
            color: "#ff9800",
            border: "1px solid #444",
            borderLeft: "4px solid #ff9800", // Warning left border
          },
        },
        // Info toast specific styling
        info: {
          style: {
            background: "#222",
            color: "#2196f3",
            border: "1px solid #444",
            borderLeft: "4px solid #2196f3", // Info left border
          },
        },
      }}
    >
      {(t) => {
        // Determine which icon to show based on toast type
        let IconComponent = Info;
        let iconColor = "#2196f3";

        if (t.type === "success") {
          IconComponent = CheckCircle;
          iconColor = "#4caf50";
        } else if (t.type === "error") {
          IconComponent = AlertCircle;
          iconColor = "#f44336";
        } else if (t.type === "warning") {
          IconComponent = AlertTriangle;
          iconColor = "#ff9800";
        }

        return (
          <div
            style={{
              ...t.style,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconComponent size={18} color={iconColor} />
              <p style={{ margin: 0, fontWeight: "500" }}>{t.message}</p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#999",
                cursor: "pointer",
                marginLeft: "8px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#999")}
              aria-label="Close toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      }}
    </Toaster>
  );
};

// Custom global styles for animations
const toastStyles = `
  @keyframes enter {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes leave {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  .custom-toast {
    animation: enter 0.3s ease-out;
  }
  .custom-toast.animate-leave {
    animation: leave 0.3s ease-in forwards;
  }
  .custom-toast:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

// Add styles to document
const addStylesToDocument = () => {
  if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = toastStyles;
    document.head.appendChild(styleSheet);
  }
};

// Call function if we're in the browser
if (typeof window !== "undefined") {
  addStylesToDocument();
}

// Helper functions for easier toast creation
const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast.warning(message),
  info: (message) => toast(message),
};

export { showToast };
export default toast;
