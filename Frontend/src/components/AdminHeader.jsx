import { useNavigate, NavLink, useLocation } from "react-router-dom";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";
import { FaMoneyBillWave } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "../store/authSlice";
import Logo from "./Logo";

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const fullText = "MessEase";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await api.post("/api/admin/logout");
      dispatch(logout());
      toast.success("Logged out successfully!");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        try {
          const res = await api.post("/api/admin/verify-token");
          console.log("header call to save data in redux auth", res.data);
          console.log("check", res.data, window.location.pathname);
          dispatch(setUser(res.data.userInfo));
        } catch (err) {
          console.error("Token verification failed", err);
          navigate("/admin/login");
        }
      }
    };
    fetchUser();
  }, [dispatch, navigate, user]);

  // Navigation links with their paths
  const navLinks = [
    { title: "Dashboard", path: "/admin/home", icon: "home" },
    { title: "Elections", path: "/admin/election", icon: "vote-yea" },
    { title: "Profile", path: "/admin/profile", icon: "user" },
    { title: "Fees", path: "/admin/payments", icon: "money" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-lg h-[60px] sticky top-0 z-50">
      <div className="flex items-center w-[200px]">
        <Logo />
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold border-b-2 border-blue-400 pb-1 flex items-center transition-all duration-300"
                : "text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center hover:scale-105"
            }
          >
            {link.icon === "home" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            )}
            {link.icon === "vote-yea" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            )}
            {link.icon === "user" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {link.icon === "money" && <FaMoneyBillWave className="mr-2" />}
            {link.title}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-xl z-50 animate-fadeIn">
            <div className="py-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `${
                      isActive ? "bg-gray-700 text-blue-400" : "text-gray-300"
                    } block px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-200`
                  }
                >
                  <div className="flex items-center">
                    {link.icon === "home" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    )}
                    {link.icon === "vote-yea" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    )}
                    {link.icon === "user" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {link.icon === "money" && (
                      <FaMoneyBillWave className="mr-2" />
                    )}
                    {link.title}
                  </div>
                </NavLink>
              ))}
              <div className="border-t border-gray-700 my-1"></div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Logout Button */}
      <button
        onClick={handleLogout}
        className="hidden md:flex items-center bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 px-4 py-2 rounded-md transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
            clipRule="evenodd"
          />
        </svg>
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
