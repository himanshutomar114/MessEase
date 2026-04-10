import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import useHostelCheck from "../../hooks/useHostelCheck";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";

const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [loading, setLoading] = useState(true);
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [courseInfo, setCourseInfo] = useState([]);
  const [academicStats, setAcademicStats] = useState([]);
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();

  // Fetch academic data from backend
  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic calendar
        const calendarResponse = await api.get("/api/student/academic-calendar");
        if (calendarResponse.data.success) {
          setAcademicCalendar(calendarResponse.data.data);
        }

        // Fetch course information
        const coursesResponse = await api.get("/api/student/courses");
        if (coursesResponse.data.success) {
          setCourseInfo(coursesResponse.data.data);
        }

        // Fetch academic statistics
        const statsResponse = await api.get("/api/student/academic-stats");
        if (statsResponse.data.success) {
          setAcademicStats(statsResponse.data.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching academic data:", error);
        
        // Set fallback mock data if API fails
        setAcademicCalendar(getMockCalendar());
        setCourseInfo(getMockCourses());
        setAcademicStats(getMockStats());
        
        toast.error(
          error.response?.data?.message ||
            "Failed to load academic data. Showing sample data."
        );
        setLoading(false);
      }
    };

    fetchAcademicData();
  }, []);

  // Mock data functions - use these as fallback
  const getMockCalendar = () => [
    {
      month: "April 2026",
      events: [
        { date: "10", event: "Semester Classes Begin", type: "academic" },
        { date: "15", event: "Add/Drop Deadline", type: "deadline" },
        { date: "25", event: "Midterm Exams Begin", type: "exam" },
      ],
    },
    {
      month: "May 2026",
      events: [
        { date: "5", event: "Midterm Exams End", type: "exam" },
        { date: "10", event: "Assignment Submission Deadline", type: "deadline" },
        { date: "18", event: "Memorial Day - No Classes", type: "holiday" },
      ],
    },
    {
      month: "June 2026",
      events: [
        { date: "1", event: "End of Semester", type: "academic" },
        { date: "15", event: "Final Exams Begin", type: "exam" },
        { date: "30", event: "Grades Due", type: "deadline" },
      ],
    },
  ];

  const getMockCourses = () => [
    {
      id: 1,
      code: "CS101",
      title: "Data Structures",
      instructor: "Dr. Sharma",
      credits: 4,
      grade: "A",
      status: "completed",
    },
    {
      id: 2,
      code: "CS102",
      title: "Web Development",
      instructor: "Prof. Gupta",
      credits: 3,
      grade: "A-",
      status: "ongoing",
    },
    {
      id: 3,
      code: "CS103",
      title: "Database Systems",
      instructor: "Dr. Patel",
      credits: 4,
      grade: "B+",
      status: "ongoing",
    },
    {
      id: 4,
      code: "CS104",
      title: "Machine Learning",
      instructor: "Prof. Singh",
      credits: 3,
      grade: "B",
      status: "upcoming",
    },
  ];

  const getMockStats = () => [
    { label: "Current GPA", value: "3.8", icon: "📊" },
    { label: "Completed Credits", value: "32", icon: "✅" },
    { label: "In Progress", value: "11", icon: "📚" },
    { label: "Upcoming", value: "3", icon: "🔜" },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "exam":
        return "text-red-400 bg-red-500 bg-opacity-20";
      case "deadline":
        return "text-orange-400 bg-orange-500 bg-opacity-20";
      case "holiday":
        return "text-green-400 bg-green-500 bg-opacity-20";
      default:
        return "text-blue-400 bg-blue-500 bg-opacity-20";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-900 text-green-200";
      case "ongoing":
        return "bg-blue-900 text-blue-200";
      case "upcoming":
        return "bg-yellow-900 text-yellow-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  // Functions to manage academic data
  const addEvent = (newEvent) => {
    // Example: Add a new calendar event
    // You can call an API endpoint to save this to the backend
    toast.success("Event added successfully!");
  };

  const addCourse = (newCourse) => {
    // Example: Add a new course
    // You can call an API endpoint to save this to the backend
    toast.success("Course added successfully!");
  };

  const updateCourseGrade = async (courseId, newGrade) => {
    try {
      const response = await api.put(`/api/student/courses/${courseId}`, {
        grade: newGrade,
      });
      if (response.data.success) {
        // Update local state
        setCourseInfo(
          courseInfo.map((course) =>
            course.id === courseId ? { ...course, grade: newGrade } : course
          )
        );
        toast.success("Grade updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update grade");
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await api.delete(`/api/student/courses/${courseId}`);
      if (response.data.success) {
        setCourseInfo(courseInfo.filter((course) => course.id !== courseId));
        toast.success("Course removed successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Academics</h1>
          <p className="text-gray-400">
            Track your courses, grades, and academic calendar
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 bg-opacity-20 mb-4">
                <div className="w-8 h-8 border-3 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400">Loading academic data...</p>
            </div>
          </div>
        )}

        {/* Academic Stats */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {academicStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === "calendar"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === "courses"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            📚 Courses
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-6 mb-8">
            {academicCalendar.map((month, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {month.month}
                </h3>
                <div className="space-y-3">
                  {month.events.map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className="flex items-center gap-4 p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-16 flex-shrink-0">
                        <p className="text-2xl font-bold text-indigo-400">
                          {event.date}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{event.event}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          event.type
                        )}`}
                      >
                        {event.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-4 mb-8">
            {courseInfo.map((course) => (
              <div
                key={course.id}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {course.code}: {course.title}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Instructor: {course.instructor}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        course.status
                      )}`}
                    >
                      {course.status.charAt(0).toUpperCase() +
                        course.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-750 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Credits</p>
                    <p className="text-lg font-bold text-white">
                      {course.credits}
                    </p>
                  </div>
                  <div className="bg-gray-750 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Current Grade</p>
                    <p
                      className={`text-lg font-bold ${
                        course.grade.includes("A")
                          ? "text-green-400"
                          : course.grade.includes("B")
                            ? "text-yellow-400"
                            : "text-white"
                      }`}
                    >
                      {course.grade}
                    </p>
                  </div>
                  <div className="bg-gray-750 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Attendance</p>
                    <p className="text-lg font-bold text-white">92%</p>
                  </div>
                </div>

                {course.status === "ongoing" && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">Course Progress</p>
                      <p className="text-sm font-semibold text-indigo-400">
                        60%
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Important Info Box */}
        <div className="bg-gradient-to-r from-orange-900 to-red-900 p-6 rounded-xl border border-orange-700 mb-8">
          <div className="flex gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Attendance Requirement
              </h3>
              <p className="text-orange-100">
                To be eligible for exams, you must maintain a minimum attendance
                of 75%. Current attendance: 92%. Keep it up!
              </p>
            </div>
          </div>
        </div>

        {/* Document Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-750 transition-all duration-300 text-left">
            <p className="text-gray-400 text-sm mb-1">📜</p>
            <p className="text-white font-semibold">Academic Transcript</p>
            <p className="text-gray-500 text-xs mt-1">Download PDF</p>
          </button>
          <button className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-750 transition-all duration-300 text-left">
            <p className="text-gray-400 text-sm mb-1">🎓</p>
            <p className="text-white font-semibold">Course Syllabus</p>
            <p className="text-gray-500 text-xs mt-1">View Details</p>
          </button>
          <button className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-750 transition-all duration-300 text-left">
            <p className="text-gray-400 text-sm mb-1">📋</p>
            <p className="text-white font-semibold">Grade Report</p>
            <p className="text-gray-500 text-xs mt-1">Download PDF</p>
          </button>
        </div>
          </>
        )}

        {/* Footer Navigation */}
        <div>
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

export default AcademicsPage;
