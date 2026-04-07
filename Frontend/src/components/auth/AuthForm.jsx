//This is the form component of not working login page
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

const AuthForm = ({
  fields,
  onSubmit,
  submitText,
  title,
  showGoogleAuth = true,
  GoogleAuthComponent = null,
  darkMode = false,
  containerless = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  // State to track which password fields are visible
  const [passwordVisibility, setPasswordVisibility] = useState({});
  // Track input focus state
  const [focusedInput, setFocusedInput] = useState(null);

  // Toggle password visibility for a specific field
  const togglePasswordVisibility = (fieldId) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // Handle input focus
  const handleFocus = (fieldId) => setFocusedInput(fieldId);
  const handleBlur = () => setFocusedInput(null);

  // Define base classes for dark mode vs. light mode with smaller inputs
  const containerClass = darkMode
    ? "w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
    : "w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200";

  const titleClass = darkMode
    ? "text-2xl font-semibold text-center text-white mb-4"
    : "text-2xl font-semibold text-center text-gray-800 mb-6";

  const labelClass = darkMode
    ? "text-sm font-medium text-gray-300 mb-1 ml-1"
    : "text-sm font-medium text-gray-700 mb-1 ml-1";

  // Enhanced input styling with transitions
  const getInputClass = (fieldId) => {
    const baseInputClass = darkMode
      ? "w-full bg-gray-700 text-white border p-2 rounded-lg focus:outline-none transition-all duration-300 text-base"
      : "w-full border p-2 rounded-lg focus:outline-none transition-all duration-300 text-base";

    // Default state
    let borderClass = darkMode ? "border-gray-600" : "border-gray-300";

    // Error state takes precedence
    if (errors[fieldId]) {
      borderClass = "border-red-500";
    }
    // Focused state
    else if (focusedInput === fieldId) {
      borderClass = darkMode
        ? "border-blue-400 ring-2 ring-blue-500/30"
        : "border-blue-500 ring-2 ring-blue-500/30";
    }

    return `${baseInputClass} ${borderClass}`;
  };

  const errorClass = "text-red-500 text-xs mt-1 ml-1";

  const buttonClass = darkMode
    ? "w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition duration-200 mt-2"
    : "w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition duration-200 mt-2";

  const eyeButtonClass = darkMode
    ? "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
    : "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200";

  const formContent = (
    <>
      {title && <h2 className={titleClass}>{title}</h2>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <label htmlFor={field.id} className={labelClass}>
              {field.label}
            </label>
            <div className="relative">
              <input
                id={field.id}
                type={
                  field.type === "password" && passwordVisibility[field.id]
                    ? "text"
                    : field.type
                }
                {...register(field.id, field.validation)}
                className={getInputClass(field.id)}
                onFocus={() => handleFocus(field.id)}
                onBlur={handleBlur}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
              />
              {field.type === "password" && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.id)}
                  className={eyeButtonClass}
                  aria-label={
                    passwordVisibility[field.id]
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {passwordVisibility[field.id] ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              )}
            </div>
            {errors[field.id] && (
              <p className={errorClass}>{errors[field.id].message}</p>
            )}
          </div>
        ))}

        <button type="submit" className={buttonClass}>
          {submitText}
        </button>

        {showGoogleAuth && GoogleAuthComponent && (
          <div className="mt-6 text-center">
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-600 opacity-50"></div>
              <span
                className={
                  darkMode
                    ? "flex-shrink mx-4 text-gray-400 text-sm font-medium"
                    : "flex-shrink mx-4 text-gray-500 text-sm font-medium"
                }
              >
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-600 opacity-50"></div>
            </div>
            <div className="mt-2">{GoogleAuthComponent}</div>
          </div>
        )}
      </form>
    </>
  );

  // If containerless is true, render just the form content without the container
  if (containerless) {
    return formContent;
  }

  // Otherwise, wrap in the container
  return <div className={containerClass}>{formContent}</div>;
};

export default AuthForm;
