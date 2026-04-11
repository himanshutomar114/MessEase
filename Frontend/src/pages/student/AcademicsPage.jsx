import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import useHostelCheck from "../../hooks/useHostelCheck";
import toast from "react-hot-toast";
import api from "../../utils/axiosRequest";

const AcademicsPage = () => {
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // CGPA State
  const [cgpa, setCgpa] = useState(3.8);
  const [cgpaModalOpen, setCgpaModalOpen] = useState(false);
  const [newCgpa, setNewCgpa] = useState(3.8);

  // Timetable State
  const timeslots = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  
  // Calculate semester dynamically (Semester 1: Jan-May, Semester 2: Jun-Oct, etc.)
  const getSemesterInfo = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    let semesterNum, semesterStart, semesterEnd;
    
    if (month >= 0 && month < 5) {
      // Semester 1: January to May
      semesterNum = 1;
      semesterStart = new Date(year, 0, 1); // Jan 1
      semesterEnd = new Date(year, 4, 31); // May 31
    } else if (month >= 5 && month < 10) {
      // Semester 2: June to October
      semesterNum = 2;
      semesterStart = new Date(year, 5, 1); // Jun 1
      semesterEnd = new Date(year, 9, 31); // Oct 31
    } else {
      // Semester 3: November to December + next year's January
      semesterNum = 3;
      semesterStart = new Date(year, 10, 1); // Nov 1
      semesterEnd = new Date(year + 1, 0, 31); // Next year Jan 31
    }
    
    return { semesterNum, semesterStart, semesterEnd };
  };
  
  const { semesterNum, semesterStart, semesterEnd } = getSemesterInfo();
  
  // Generate weeks based on actual semester dates (dynamically calculated)
  const generateWeeks = () => {
    const weeks = [];
    const diffTime = Math.abs(semesterEnd - semesterStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.ceil(diffDays / 7);
    
    let currentDate = new Date(semesterStart);
    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4); // Mon-Fri (5 days)
      
      const weekLabel = `Week ${i + 1} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      weeks.push(weekLabel);
      
      currentDate.setDate(currentDate.getDate() + 7); // Move to next week
    }
    
    return weeks;
  };
  
  const weeks = generateWeeks();
  
  // All subjects start empty - student creates classes by adding subject names
  // No mock data - clean slate for each student

  const [timetable, setTimetable] = useState({});
  const [semester, setSemester] = useState(1);
  const [attendancePercentage, setAttendancePercentage] = useState(0); // Store from DB
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null); // Track which subject is being edited
  const [editingSubjectValue, setEditingSubjectValue] = useState(""); // Track the value being edited
  const [selectedWeek, setSelectedWeek] = useState(0); // Track which week to display

  // Fetch academics data on component mount
  useEffect(() => {
    const fetchAcademicsData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/student/academics/get", {
          params: {
            semester: semesterNum,
            academicYear: new Date().getFullYear().toString(),
          }
        });
        
        if (response.data?.data) {
          const academicsData = response.data.data;
          
          // Set CGPA
          setCgpa(academicsData.cgpa || 3.8);
          setNewCgpa(academicsData.cgpa || 3.8);
          setSemester(academicsData.semester || semesterNum);
          
          // Set attendance percentage from database
          setAttendancePercentage(academicsData.attendancePercentage || 0);
          
          // Convert timetable from Map/object format (week-based structure)
          let loadedTimetable = academicsData.timetable || {};
          
          // If empty, initialize with empty subjects for all weeks
          if (Object.keys(loadedTimetable).length === 0) {
            loadedTimetable = {};
            weeks.forEach(week => {
              loadedTimetable[week] = {};
              days.forEach(day => {
                loadedTimetable[week][day] = {};
                timeslots.forEach((slot) => {
                  loadedTimetable[week][day][slot] = {
                    subject: "",  // Start with empty subject - student creates classes
                    attended: false,
                  };
                });
              });
            });
          } else {
            // Ensure all weeks/days/slots have proper structure from DB
            weeks.forEach(week => {
              if (!loadedTimetable[week]) {
                loadedTimetable[week] = {};
              }
              days.forEach(day => {
                if (!loadedTimetable[week][day]) {
                  loadedTimetable[week][day] = {};
                }
                timeslots.forEach((slot) => {
                  if (!loadedTimetable[week][day][slot]) {
                    loadedTimetable[week][day][slot] = {
                      subject: "",  // Start with empty
                      attended: false,
                    };
                  } else {
                    // Preserve attended flag AND subject from DB
                    if (typeof loadedTimetable[week][day][slot].attended === 'undefined') {
                      loadedTimetable[week][day][slot].attended = false;
                    }
                    if (!loadedTimetable[week][day][slot].subject) {
                      loadedTimetable[week][day][slot].subject = "";
                    }
                  }
                });
              });
            });
          }
          
          setTimetable(loadedTimetable);
          toast.success("Academics data loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching academics data:", error);
        console.error("Error response:", error.response?.data);
        // Initialize with default data if fetch fails
        const initial = {};
        weeks.forEach(week => {
          initial[week] = {};
          days.forEach(day => {
            initial[week][day] = {};
            timeslots.forEach((slot) => {
              initial[week][day][slot] = {
                subject: "",  // Start with empty
                attended: false,
              };
            });
          });
        });
        setTimetable(initial);
        toast.error(error.response?.data?.message || "Failed to load academics data from server");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicsData();
  }, []);

  // Get total classes (only count slots with non-empty subject names)
  const getTotalValidClasses = () => {
    let totalValid = 0;
    weeks.forEach(week => {
      days.forEach(day => {
        timeslots.forEach(slot => {
          const subject = timetable[week]?.[day]?.[slot]?.subject || "";
          if (subject.trim() !== "") {
            totalValid++;
          }
        });
      });
    });
    return totalValid;
  };

  // Calculate total attendance (only count classes with subjects)
  const calculateAttendance = () => {
    let totalValidClasses = 0;
    let attendedClasses = 0;
    
    weeks.forEach(week => {
      days.forEach(day => {
        timeslots.forEach(slot => {
          const subject = timetable[week]?.[day]?.[slot]?.subject || "";
          // Only count if subject is not empty
          if (subject.trim() !== "") {
            totalValidClasses++;
            if (timetable[week]?.[day]?.[slot]?.attended) {
              attendedClasses++;
            }
          }
        });
      });
    });

    return totalValidClasses > 0 ? Math.round((attendedClasses / totalValidClasses) * 100) : 0;
  };

  // Save to backend
  const saveToBackend = async (data) => {
    try {
      setIsSaving(true);
      const response = await api.post("/api/student/academics/update", {
        cgpa: data.cgpa !== undefined ? data.cgpa : cgpa,
        timetable: data.timetable || timetable,
        semester: semesterNum,
        academicYear: new Date().getFullYear().toString(),
      });
      
      if (response.data?.data) {
        // Extract and update attendance percentage from database response
        const attendancePercentFromDB = response.data.data.attendancePercentage || 0;
        setAttendancePercentage(attendancePercentFromDB);
        toast.success(`Data saved successfully (Attendance: ${attendancePercentFromDB}%)`);
        console.log("Backend response attendance %:", attendancePercentFromDB);
      }
    } catch (error) {
      console.error("Error saving academics data:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save data to server";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle attendance (week-based) - only allow for created classes
  const toggleAttendance = (week, day, slot) => {
    const subject = timetable[week]?.[day]?.[slot]?.subject || "";
    // Only allow attendance marking for classes with subject names
    if (subject.trim() === "") {
      toast.error("Add a subject name first to mark attendance");
      return;
    }

    const updated = { ...timetable };
    updated[week][day][slot].attended = !updated[week][day][slot].attended;
    setTimetable(updated);
    
    // Save to backend
    saveToBackend({ timetable: updated });
  };

  // Update CGPA
  const handleUpdateCgpa = async () => {
    if (newCgpa < 0 || newCgpa > 10) {
      toast.error("CGPA must be between 0 and 10");
      return;
    }
    
    setCgpa(newCgpa);
    setCgpaModalOpen(false);
    
    // Save to backend
    await saveToBackend({ cgpa: newCgpa });
    toast.success("CGPA updated successfully!");
  };

  // Handle subject edit
  const handleEditSubject = (week, day, slot) => {
    setEditingSubject(`${week}-${day}-${slot}`);
    setEditingSubjectValue(timetable[week]?.[day]?.[slot]?.subject || "");
  };

  // Handle subject name change
  const handleSubjectChange = (e) => {
    setEditingSubjectValue(e.target.value);
  };

  // Save subject edit
  const handleSaveSubject = async (week, day, slot) => {
    const updated = { ...timetable };
    
    // Get all weeks to update same day/slot across all weeks
    const allWeeks = generateWeeks();
    
    // Update all weeks for the same day and slot
    allWeeks.forEach(w => {
      if (updated[w] && updated[w][day] && updated[w][day][slot]) {
        updated[w][day][slot].subject = editingSubjectValue.trim();
      }
    });
    
    setTimetable(updated);
    setEditingSubject(null);
    setEditingSubjectValue("");

    // Save to backend
    await saveToBackend({ timetable: updated });
    toast.success("Subject updated successfully!");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditingSubjectValue("");
  };

  // Reset timetable
  const handleResetTimetable = async () => {
    try {
      await api.post("/api/student/academics/reset-semester", {
        semester: semesterNum,
        academicYear: new Date().getFullYear().toString(),
      });
      
      // Reset local state for all weeks - start empty
      const initial = {};
      weeks.forEach(week => {
        initial[week] = {};
        days.forEach(day => {
          initial[week][day] = {};
          timeslots.forEach((slot) => {
            initial[week][day][slot] = {
              subject: "",  // Start with empty
              attended: false,
            };
          });
        });
      });
      setTimetable(initial);
      toast.success("Timetable and attendance reset for new semester");
    } catch (error) {
      console.error("Error resetting semester:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset semester";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 bg-opacity-20 mb-4">
              <div className="w-8 h-8 border-3 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400">Loading academics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Academics</h1>
          <p className="text-gray-400">Track your CGPA and attendance</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Semester {semesterNum}</span> • 
              <span className="ml-2">{semesterStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {semesterEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">{weeks.length} weeks • {getTotalValidClasses()} classes scheduled</p>
          </div>
        </div>

        {/* CGPA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current CGPA */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-xl shadow-lg border border-indigo-700">
            <p className="text-gray-300 text-sm mb-2">Current CGPA</p>
            <h2 className="text-5xl font-bold text-white mb-4">{cgpa.toFixed(2)}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewCgpa(cgpa);
                  setCgpaModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Update CGPA
              </button>
            </div>
          </div>

          {/* Overall Attendance */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 p-8 rounded-xl shadow-lg border border-green-700">
            <p className="text-gray-300 text-sm mb-2">Attendance This Semester</p>
            <h2 className="text-5xl font-bold text-white mb-4">{calculateAttendance()}%</h2>
          </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">📅 5-Month Attendance Tracker</h2>
              <p className="text-gray-400 text-sm">22 weeks total | Currently viewing <span className="text-indigo-400 font-semibold">{weeks[selectedWeek]}</span></p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Reset Semester
            </button>
          </div>

          {/* Week Selector */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <p className="text-gray-300 text-sm font-semibold mb-3">Select Week:</p>
            <div className="flex gap-2 flex-wrap">
              {weeks.map((week, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedWeek(idx)}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    selectedWeek === idx
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-750 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  W{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Timetable for Selected Week */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="p-3 text-left text-indigo-400 font-semibold">Time</th>
                  {days.map(day => (
                    <th key={day} className="p-3 text-center text-indigo-400 font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeslots.map((slot) => (
                  <tr key={slot} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="p-3 font-semibold text-gray-300 w-20">{slot}</td>
                    {days.map(day => (
                      <td key={`${day}-${slot}`} className="p-3 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {editingSubject === `${weeks[selectedWeek]}-${day}-${slot}` ? (
                            <div className="flex gap-1 w-full mb-2">
                              <input
                                type="text"
                                value={editingSubjectValue}
                                onChange={handleSubjectChange}
                                placeholder="Enter subject"
                                autoFocus
                                className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-indigo-500 outline-none"
                              />
                              <button
                                onClick={() => handleSaveSubject(weeks[selectedWeek], day, slot)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <p
                              onClick={() => handleEditSubject(weeks[selectedWeek], day, slot)}
                              className="text-sm text-indigo-300 mb-2 cursor-pointer hover:text-indigo-200 hover:underline transition-colors px-2 py-1 rounded hover:bg-gray-750 w-full"
                            >
                              {timetable[weeks[selectedWeek]]?.[day]?.[slot]?.subject || "+ Add subject"}
                              <span className="ml-1 text-xs text-gray-500">✎</span>
                            </p>
                          )}
                          <label className={`flex items-center gap-2 ${timetable[weeks[selectedWeek]]?.[day]?.[slot]?.subject?.trim() ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                            <input
                              type="checkbox"
                              checked={timetable[weeks[selectedWeek]]?.[day]?.[slot]?.attended || false}
                              onChange={() => toggleAttendance(weeks[selectedWeek], day, slot)}
                              disabled={isSaving || !timetable[weeks[selectedWeek]]?.[day]?.[slot]?.subject?.trim()}
                              className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-gray-400">
                              {!timetable[weeks[selectedWeek]]?.[day]?.[slot]?.subject?.trim() ? "×" : timetable[weeks[selectedWeek]]?.[day]?.[slot]?.attended ? "✓" : "○"}
                            </span>
                          </label>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance Details */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Attendance This Semester (Semester {semesterNum})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Classes</p>
                <p className="text-2xl font-bold text-white">{getTotalValidClasses()}</p>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Classes Attended</p>
                <p className="text-2xl font-bold text-green-400">
                  {(() => {
                    let attendedCount = 0;
                    for (const week in timetable) {
                      for (const day in timetable[week]) {
                        for (const slot in timetable[week][day]) {
                          const subject = timetable[week][day][slot].subject || "";
                          if (subject.trim() !== "" && timetable[week][day][slot].attended) {
                            attendedCount++;
                          }
                        }
                      }
                    }
                    return `${attendedCount} / ${getTotalValidClasses()}`;
                  })()}
                </p>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Attendance Percentage</p>
                <p className={`text-2xl font-bold ${calculateAttendance() >= 75 ? "text-green-400" : "text-orange-400"}`}>
                  {calculateAttendance()}%
                </p>
              </div>
            </div>
          </div>

          {/* Minimum Attendance Warning */}
          {calculateAttendance() < 75 && (
            <div className="mt-4 p-4 bg-orange-900 border border-orange-700 rounded-lg">
              <p className="text-orange-200">
                ⚠️ Your attendance is below 75%. You need to attend {Math.ceil(((75 - calculateAttendance()) / 100) * getTotalValidClasses())} more classes to reach 75%.
              </p>
            </div>
          )}
        </div>

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

        {/* Update CGPA Modal */}
        {cgpaModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Update CGPA</h2>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  New CGPA (0.00 - 10.00)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newCgpa}
                  onChange={(e) => setNewCgpa(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCgpaModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCgpa}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Timetable Confirmation Modal */}
        {resetConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-red-700">
              <h2 className="text-2xl font-bold text-white mb-4">Reset Timetable?</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to reset the timetable and attendance for the new semester? This will clear all attendance records. Student confirmation is required first.
              </p>
              <p className="text-yellow-400 text-sm mb-4 font-semibold">
                Please confirm that you understand this action will reset your attendance records.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleResetTimetable();
                    setResetConfirmOpen(false);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? "Resetting..." : "Reset Confirmed"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicsPage;
