import React, { useEffect } from "react";

// Reusable Lottie component that takes a source URL
const LottieAnimation = ({
  src,
  width = "300px",
  height = "300px",
  speed = 1,
}) => {
  useEffect(() => {
    // This effect ensures the script is loaded only once across all instances
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      script.type = "module";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <dotlottie-player
      src={src}
      background="transparent"
      speed={speed}
      style={{ width, height }}
      loop
      autoplay
    />
  );
};

export default LottieAnimation;
