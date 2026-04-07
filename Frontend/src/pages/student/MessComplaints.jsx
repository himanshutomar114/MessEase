import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/axiosRequest";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useHostelCheck from "../../hooks/useHostelCheck";
import { useSelector } from "react-redux";

const MessComplaints = () => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userComplaints, setUserComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const { loadingCheck } = useHostelCheck();

  const fileInputRef = useRef(null);
  const notificationTimeout = useRef(null);
  const navigate = useNavigate();
  const complaintsCategories = [
    "Food Quality",
    "Service",
    "Menu Concerns",
    "Hostel",
  ];

  const code = useParams();

  const isBlocked = useSelector((state) => state.auth.isBlocked);
  useEffect(() => {
    if (isBlocked) {
      toast.error("You are blocked by admin.");
      navigate("/student/home");
    }
  }, [isBlocked]);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/complaint/usercomplaints`);
        // Sort complaints by date (newest first)
        const complaints = response.data.complaints || response.data || [];
        const sortedComplaints = complaints.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserComplaints(sortedComplaints);
      } catch (err) {
        console.error("Get complaints error:", err.response?.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [code, success]); // Re-fetch when success changes (after new submission)

  // Clear notifications after timeout
  useEffect(() => {
    if (success || error) {
      // Clear any existing timeout
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }

      // Set new timeout to clear notification after 5 seconds
      notificationTimeout.current = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, [success, error]);

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    // Filter out duplicates by name and size
    setImages((prevImages) => {
      const updatedImages = [...prevImages];

      newFiles.forEach((newFile) => {
        const isDuplicate = prevImages.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        );

        if (!isDuplicate) {
          updatedImages.push(newFile);
        }
      });

      return updatedImages;
    });

    // Reset the input value to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add form data
    if (description) formData.append("description", description);
    if (category) formData.append("category", category);

    // Append images
    images.forEach((image) => {
      formData.append(`images`, image);
    });

    try {
      const response = await api.post(
        "/api/complaint/createcomplaint",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Reset form on successful submission
      setDescription("");
      setCategory("");
      setImages([]);
      setSuccess(response.data.message || "Complaint submitted successfully");

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-400 bg-yellow-900/20";
      case "resolved":
        return "text-green-400 bg-green-900/20";
      case "rejected":
        return "text-red-400 bg-red-900/20";
      case "in progress":
        return "text-blue-400 bg-blue-900/20";
      default:
        return "text-gray-400 bg-gray-800/20";
    }
  };

  // Open image modal
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

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
      <Header />
      <div className="bg-[#0A0A1A] min-h-screen p-4 md:p-6">
        {/* Success Notification */}
        {success && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-[fadeInDown_0.5s_ease-out_forwards]">
            <div className="bg-green-900 border-l-4 border-green-500 text-white p-4 rounded shadow-lg flex items-start">
              <div className="mr-3 pt-0.5">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">Success!</h3>
                <p className="mt-1">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-300 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-[fadeInDown_0.5s_ease-out_forwards]">
            <div className="bg-red-900 border-l-4 border-red-500 text-white p-4 rounded shadow-lg flex items-start">
              <div className="mr-3 pt-0.5">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">Error</h3>
                <p className="mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <div
              className="max-w-4xl max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={closeImageModal}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Complaint Form Section */}
          <div className="w-full bg-[#1A1A2E] shadow-2xl rounded-lg border border-[#2A2A4A] p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              Mess Complaints
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-gray-300 mb-2 block">Complaint Category</p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-[#0A0A1A] border border-[#2A2A4A] text-white p-2 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {complaintsCategories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-[#1A1A2E] text-white"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-gray-300 mb-2 block">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your complaint in detail"
                  className="w-full min-h-[120px] bg-[#0A0A1A] border border-[#2A2A4A] text-white placeholder-gray-500 p-2 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <p className="text-gray-300 mb-2 block">
                  Upload Images (Optional)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="w-full bg-[#0A0A1A] border border-[#2A2A4A] text-white p-2 rounded
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-700 file:text-white
                  hover:file:bg-purple-600
                  focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-300 mb-2">Selected Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              openImageModal(URL.createObjectURL(image))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!category || !description || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-md font-medium disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Complaint"
                )}
              </button>
            </form>
          </div>

          {/* Recent Complaints Section */}
          <div className="w-full bg-[#1A1A2E] shadow-2xl rounded-lg border border-[#2A2A4A] p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              Your Recent Complaints
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : userComplaints.length === 0 ? (
              <div className="text-center bg-[#0A0A1A] border border-[#2A2A4A] rounded-lg p-8 py-16">
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="h-10 w-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No Recent Complaints
                </h3>
                <p className="text-gray-400 max-w-xs mx-auto mb-6">
                  You haven't submitted any complaints yet. Use the form to file
                  a new complaint.
                </p>
                <div className="border-t border-[#2A2A4A] pt-6 mt-6">
                  <p className="text-sm text-gray-500">
                    All your submitted complaints will appear here for easy
                    tracking
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#4A4A6A] scrollbar-track-[#0A0A1A] scrollbar-thumb-rounded-full scrollbar-track-rounded-full hover:scrollbar-thumb-[#6A6A8A]">
                {userComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="bg-[#0A0A1A] border border-[#2A2A4A] rounded-lg p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-purple-900 text-white text-xs px-2 py-1 rounded-md">
                        {complaint.category}
                      </span>
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(complaint.status)}`}
                      >
                        {complaint.status || "Pending"}
                      </span>
                    </div>

                    <p className="text-white mb-2">{complaint.description}</p>

                    {complaint.images && complaint.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-[#4A4A6A] scrollbar-track-[#0A0A1A] scrollbar-h-1 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                        {complaint.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url || image}
                            alt={`Complaint image ${index + 1}`}
                            className="h-16 w-16 object-cover rounded border border-gray-700 hover:border-purple-500 cursor-pointer transition-all duration-200 hover:opacity-90"
                            onClick={() => openImageModal(image.url || image)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-3 border-t border-[#2A2A4A] pt-2 flex justify-between items-center text-xs text-gray-400">
                      <span>ID: {complaint._id?.substring(0, 8) || "N/A"}</span>
                      <span>{formatDate(complaint.createdAt)}</span>
                    </div>

                    {complaint.response && (
                      <div className="mt-3 pt-3 border-t border-[#2A2A4A]">
                        <p className="text-xs text-gray-400 mb-1">Response:</p>
                        <p className="text-sm text-gray-300 bg-purple-900/10 p-3 rounded-md">
                          {complaint.response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessComplaints;
