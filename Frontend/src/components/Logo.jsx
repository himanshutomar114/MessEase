import { Utensils } from "lucide-react";
import { useEffect, useState } from "react";

const Logo = () => {
  const [text, setText] = useState("");
  const fullText = "MessEase";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [iconSize, setIconSize] = useState(32);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Icon pulsing effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIconSize((prev) => (prev === 32 ? 36 : 32));
    }, 500);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="flex items-center w-[200px]">
      <div className="relative flex-shrink-0 w-[40px]">
        <Utensils
          className="text-orange-400 transition-all duration-300 ease-in-out"
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        />
      </div>
      <div className="flex items-center w-[160px]">
        <h1 className="text-2xl font-bold relative">
          <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            {text}
          </span>
          <span
            className={`text-orange-400 ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
          >
            |
          </span>
        </h1>
      </div>
    </div>
  );
};

export default Logo;

// import { Utensils } from "lucide-react";
// import { useEffect, useState } from "react";

// const Logo = ({ className = "" }) => {
//   const [text, setText] = useState("");
//   const fullText = "MessEase";
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [cursorVisible, setCursorVisible] = useState(true);
//   const [iconSize, setIconSize] = useState(32);

//   // Typewriter effect
//   useEffect(() => {
//     if (currentIndex < fullText.length) {
//       const timeout = setTimeout(() => {
//         setText((prev) => prev + fullText[currentIndex]);
//         setCurrentIndex((prev) => prev + 1);
//       }, 150);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentIndex]);

//   // Cursor blinking effect
//   useEffect(() => {
//     const cursorInterval = setInterval(() => {
//       setCursorVisible((prev) => !prev);
//     }, 530);
//     return () => clearInterval(cursorInterval);
//   }, []);

//   // Icon pulsing effect
//   useEffect(() => {
//     const pulseInterval = setInterval(() => {
//       setIconSize((prev) => (prev === 32 ? 36 : 32));
//     }, 500);
//     return () => clearInterval(pulseInterval);
//   }, []);

//   return (
//     // Removed fixed widths and added gap for spacing.
//     <div className={`flex items-center gap-2 ${className}`}>
//       <div className="relative flex-shrink-0">
//         <Utensils
//           className="text-orange-400 transition-all duration-300 ease-in-out"
//           style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
//         />
//       </div>
//       <div>
//         <h1 className="text-2xl font-bold relative">
//           <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
//             {text}
//           </span>
//           <span
//             className={`text-orange-400 ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
//           >
//             |
//           </span>
//         </h1>
//       </div>
//     </div>
//   );
// };

// export default Logo;
