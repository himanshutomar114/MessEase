// //This is GoogleAuthButton component of not working login page
// import React from "react";
// import { GoogleLogin } from "@react-oauth/google";
// import useGoogleAuth from "../../hooks/useGoogleAuth";

// const GoogleAuthButton = ({ userType, buttonText, darkMode = false }) => {
//   const { handleGoogleSuccess, handleGoogleFailure } = useGoogleAuth(userType);

//   // Adjust button classes based on darkMode
//   const buttonClass = darkMode
//     ? "w-full flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-200 bg-gray-800"
//     : "w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200";

//   const textClass = darkMode
//     ? "text-white font-medium"
//     : "text-gray-700 font-medium";

//   return (
//     <div className="w-full">
//       <GoogleLogin
//         onSuccess={handleGoogleSuccess}
//         onError={handleGoogleFailure}
//         render={(renderProps) => (
//           <button
//             onClick={renderProps.onClick}
//             disabled={renderProps.disabled}
//             className={buttonClass}
//           >
//             <img
//               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
//               alt="Google logo"
//               className="w-5 h-5"
//             />
//             <span className={textClass}>
//               {buttonText || `Sign in with Google`}
//             </span>
//           </button>
//         )}
//       />
//     </div>
//   );
// };

// export default GoogleAuthButton;

import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "../../hooks/useGoogleAuth";

const GoogleAuthButton = ({ userType, buttonText, darkMode = false }) => {
  const { handleGoogleSuccess, handleGoogleFailure } = useGoogleAuth(userType);

  // Adjust button classes based on darkMode
  const buttonClass = darkMode
    ? "w-full flex items-center justify-center gap-2 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-200 bg-gray-800"
    : "w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200";

  const textClass = darkMode
    ? "text-white font-medium"
    : "text-gray-700 font-medium";

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
        useOneTap={false}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export default GoogleAuthButton;
