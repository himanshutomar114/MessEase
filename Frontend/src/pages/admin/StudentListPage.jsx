import React, { useEffect, useState } from "react";
import api from "../../utils/axiosRequest";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import {
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaFilter,
  FaUserGraduate,
  FaUsers,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAdminAuth from "../../hooks/useAdminAuth";

const StudentListPage = () => {
  const navigate = useNavigate();
  const { loadingAdmin, isAdmin, isVerified } = useAdminAuth();

  if (!isVerified) {
    toast.error("Your College is not verified yet. Authorized access denied.");
    navigate("/admin/home");
  }
  // States for search, filters, sort, pagination and loading
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    hostel: "",
    role: "",
    blockStatus: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [filterOptions, setFilterOptions] = useState({
    branches: [],
    years: [],
    hostels: [],
    roles: [],
    blockStatusOptions: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const res = await api.get("/api/admin/students/filter-options");
      console.log(res.data.data);
      const data = res.data.data;
      setFilterOptions({
        branches: data.branches || [],
        years: data.years || [],
        hostels: data.hostels || [],
        roles: data.roles || [],
        blockStatusOptions: data.blockStatusOptions || [],
      });
    } catch (err) {
      console.error("Error fetching filter options:", err);
      toast.error("Failed to load filter options");
    }
  };

  // Fetch students with current query parameters
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        branch: filters.branch || undefined,
        year: filters.year || undefined,
        hostel: filters.hostel || undefined,
        role: filters.role || undefined,
        blockStatus: filters.blockStatus || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      };

      const res = await api.get("/api/admin/students", { params });
      const { students, pagination: pag } = res.data.data;
      setStudents(students);
      setPagination(pag);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters, sortBy, sortOrder, page]);

  // Handlers
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const goToProfile = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const resetFilters = () => {
    setFilters({
      branch: "",
      year: "",
      hostel: "",
      role: "",
      blockStatus: "",
    });
    setSearch("");
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <AdminHeader />
      <div className="w-4/5 mx-auto min-h-screen text-white p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-400 mb-4 md:mb-0">
            Student Management
          </h1>
          <div className="stats bg-gray-800 p-3 rounded-lg border border-gray-700 flex text-center">
            <div className="stat px-4">
              <div className="stat-title text-gray-400 text-xs">
                Total Students
              </div>
              <div className="stat-value text-indigo-400 text-2xl">
                {pagination.total}
              </div>
            </div>
            <div className="stat px-4 border-l border-gray-700">
              <div className="stat-title text-gray-400 text-xs">Pages</div>
              <div className="stat-value text-indigo-400 text-2xl">
                {pagination.pages}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name, roll, or room..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={toggleFilters}
              className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              <FaFilter className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4 transition-all duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={filters.branch}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Branches</option>
                    {filterOptions.branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Years</option>
                    {filterOptions.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Hostel
                  </label>
                  <select
                    name="hostel"
                    value={filters.hostel}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Hostels</option>
                    {filterOptions.hostels.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Roles</option>
                    {filterOptions.roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Status
                  </label>
                  <select
                    name="blockStatus"
                    value={filters.blockStatus}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Status</option>
                    {filterOptions.blockStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading || loadingAdmin ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Students Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700 text-gray-300">
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          <span>Name</span>
                          {sortBy === "name" && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? (
                                <FaSortAlphaDown className="text-indigo-400" />
                              ) : (
                                <FaSortAlphaUp className="text-indigo-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("room")}
                      >
                        <div className="flex items-center">
                          <span>Room</span>
                          {sortBy === "room" && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? (
                                <FaSortAlphaDown className="text-indigo-400" />
                              ) : (
                                <FaSortAlphaUp className="text-indigo-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("rollNumber")}
                      >
                        <div className="flex items-center">
                          <span>Roll Number</span>
                          {sortBy === "rollNumber" && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? (
                                <FaSortAlphaDown className="text-indigo-400" />
                              ) : (
                                <FaSortAlphaUp className="text-indigo-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-700 cursor-pointer transition duration-200"
                          onClick={() => goToProfile(student._id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaUserGraduate className="text-indigo-400 mr-3" />
                              <div className="text-sm font-medium text-white">
                                {student.name || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {student.room || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {student.rollNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {student.branch || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {student.year || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.isBlocked
                                  ? "bg-red-900 text-red-300"
                                  : "bg-green-900 text-green-300"
                              }`}
                            >
                              {student.isBlocked ? (
                                <>
                                  <FaBan className="mr-1" /> Blocked
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="mr-1" /> Active
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-400"
                        >
                          <div className="flex flex-col items-center justify-center py-6">
                            <FaUsers className="text-4xl text-gray-600 mb-3" />
                            <p>No students found matching your criteria</p>
                            <button
                              onClick={resetFilters}
                              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition duration-200"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {students.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
                students
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Prev
                </button>
                <div className="px-3 py-1 bg-indigo-600 text-white rounded-md">
                  {page}
                </div>
                <button
                  onClick={() =>
                    setPage(page < pagination.pages ? page + 1 : page)
                  }
                  disabled={page === pagination.pages}
                  className={`px-3 py-1 rounded-md ${
                    page === pagination.pages
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(pagination.pages)}
                  disabled={page === pagination.pages}
                  className={`px-3 py-1 rounded-md ${
                    page === pagination.pages
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentListPage;
