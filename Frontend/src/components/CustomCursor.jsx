import React, { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa";
import { BsFillCursorFill, BsCursorText } from "react-icons/bs";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const touchScreenQuery = window.matchMedia(
        "(hover: none) and (pointer: coarse)"
      );

      setIsMobile(mobileRegex.test(userAgent) || touchScreenQuery.matches);
    };

    // Run mobile check on load
    checkMobile();

    // If mobile, don't set up cursor and return early
    if (isMobile) {
      document.body.style.cursor = "auto";
      return;
    }

    // Hide default cursor only on non-mobile
    document.body.style.cursor = "none";

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check what element we're hovering over
      const element = document.elementFromPoint(e.clientX, e.clientY);

      // Check if it's a text input field
      const isTextField =
        element &&
        ((element.tagName === "INPUT" &&
          ["text", "email", "password", "search", "tel", "url", ""].includes(
            element.type
          )) ||
          element.tagName === "TEXTAREA" ||
          element.isContentEditable ||
          element.tagName === "SELECT");

      setIsTextInput(isTextField);

      // Check if hovering over clickable elements
      const isClickable =
        element &&
        (element.tagName === "BUTTON" ||
          element.tagName === "A" ||
          element.closest("button") ||
          element.closest("a") ||
          element.classList.contains("clickable") ||
          window.getComputedStyle(element).cursor === "pointer");

      setHovering(isClickable);
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    // Add event listeners
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Make clickable elements get proper hover effect
    const addHoverableClass = () => {
      const allElements = document.querySelectorAll("*");
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        // If this element would normally show a cursor, make sure it doesn't
        if (
          computedStyle.cursor !== "auto" &&
          computedStyle.cursor !== "default"
        ) {
          element.classList.add("custom-cursor-element");
        }

        // Add class to explicitly clickable elements
        if (
          element.tagName === "BUTTON" ||
          element.tagName === "A" ||
          element.getAttribute("role") === "button" ||
          (element.tagName === "INPUT" && element.type === "submit") ||
          element.classList.contains("clickable")
        ) {
          element.classList.add("spoon-hoverable");
        }
      });
    };

    addHoverableClass();

    // Observer to add class to dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          addHoverableClass();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for window resize to recheck device type
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      document.body.style.cursor = "auto";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [isMobile]);

  // Don't render custom cursor on mobile devices
  if (isMobile || hidden) return null;

  return (
    <>
      <style>{`
        /* Hide default cursor on all elements (except mobile) */
        ${!isMobile ? "* { cursor: none !important; }" : ""}
        
        .spoon-hoverable {
          transition: transform 0.2s ease;
        }
        
        .spoon-hoverable:hover {
          transform: scale(1.03);
        }
      `}</style>

      <div
        className="cursor-container"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          pointerEvents: "none",
          zIndex: 9999,
          transform:
            hovering || isTextInput
              ? `translate(-50%, -50%) ${clicked ? "scale(0.9)" : "scale(1)"}`
              : `translate(-2px, -2px) ${clicked ? "scale(0.9)" : "scale(1)"}`,
          transition: "transform 0.15s ease",
          color: hovering ? "#ff9500" : isTextInput ? "#4a90e2" : "#3a86ff",
          filter: `drop-shadow(0 0 3px ${hovering ? "#ff9500" : isTextInput ? "#4a90e2" : "#3a86ff"})`,
        }}
      >
        {isTextInput ? (
          <BsCursorText size={20} />
        ) : hovering ? (
          <FaUtensils size={20} />
        ) : (
          <div
            style={{
              transform: "scaleX(-1) rotate(-0deg)", // Mirror horizontally and rotate to point up-left
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BsFillCursorFill size={20} />
          </div>
        )}
      </div>
    </>
  );
};

export default CustomCursor;
