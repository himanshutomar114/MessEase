import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  CheckCircle,
  Star,
  User,
  Users,
  Coffee,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Logo from "../components/Logo";
import LottieAnimation from "../components/LottieAnimation";
import TextPressure from "../components/ui/TextPressure";
import GradientText from "../components/ui/GradientText";
import SplitText from "../components/ui/SplitText";
import SpotlightCard from "../components/ui/SpotlightCard";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const sectionsRef = useRef({});

  const navItems = ["hero", "about", "features", "screenshots", "faq", "team"];

  // Handle navigation scrolling with enhanced tracking
  useEffect(() => {
    const handleScroll = () => {
      // Update scroll position for animation effects
      setScrollY(window.scrollY);

      const sections = document.querySelectorAll("section");
      let currentActiveSection = "hero";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        // More precise section detection with viewport consideration
        if (
          window.scrollY >= sectionTop - 150 &&
          window.scrollY < sectionTop + sectionHeight - 150
        ) {
          currentActiveSection = section.id;
        }
      });

      setActiveSection(currentActiveSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Initialize Intersection Observer for animations
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, options);

    // Observe all section elements and their children with animation classes
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  // Smooth scroll to section with enhanced animation
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Handle login/signup
  const handleAuth = (role) => {
    if (role === "student") {
      navigate("/student/login");
    } else {
      navigate("/admin/login");
    }
  };

  // Team members data
  const teamMembers = [
    {
      name: "Meet Korat",
      role: "Full-Stack Developer",
      image: "/assets/meet.png",
      git: "https://github.com/meet-korat",
      insta: "https://www.instagram.com/_.meeettt_/",
      linked: "https://www.linkedin.com/in/meet-korat-43a4a9267/",
    },
    {
      name: "Harsh Sharma",
      role: "Full-Stack Developer",
      image: "/assets/harsh.png",
      git: "https://github.com/Hersheys-commits",
      insta: "https://www.instagram.com/not_too_harshh/",
      linked: "https://www.linkedin.com/in/harsh-sharma-310134298/",
    },
    {
      name: "Manu Bhusan",
      role: "Full-Stack Developer",
      image: "/assets/manu.png",
      git: "https://github.com/ManuBhushan",
      insta: "https://www.instagram.com/manu__1322_/",
      linked: "https://www.linkedin.com/in/manu-bhushan-63208827b/",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question:
        "What makes MessEase different from other mess management apps?",
      answer:
        "Mess Ease is designed specifically for hostel and mess management, offering a comprehensive suite of features tailored to the unique needs of students and administrators. Our platform focuses on real-time communication, complaint management, and meal planning, ensuring a seamless experience for all users.",
    },
    {
      question: "Is MessEase free to use?",
      answer:
        "Yes! MessEase offers a robust free tier that includes all core messaging features. For all the users, it unlocks all features to apply/vote for Managerial posts, and Fees can be paid through the app. Guest room allocation and booking is also available. Students can update their profile and see the mess menu and rate daily meals.",
    },
    {
      question: "How secure are my conversations in MessEase?",
      answer:
        "We take security seriously. All conversations on MessEase are encrypted, ensuring that your data is safe and private. We also implement strict access controls to protect your information from unauthorized access.",
    },
    {
      question: "Can I use MessEase across multiple devices?",
      answer:
        "Absolutely! MessEase seamlessly syncs across all your devices - smartphones, tablets, and computers. Your conversation history, settings, and preferences will be consistent no matter which device you're using.",
    },
    {
      question: "Does administration have access to all conversations?",
      answer:
        "No, administration does not have access to all conversations. MessEase prioritizes user privacy and confidentiality. Only the necessary information is shared with administrators for effective management, while personal conversations remain private.",
    },
    {
      question: "Does Marketplace have chat support?",
      answer:
        "Yes, Marketplace has chat support. Users can communicate directly with sellers or service providers through the app, ensuring a smooth transaction process and quick resolution of any queries.",
    },
    {
      question: "Do MessEase have a report abuse feature?",
      answer:
        "Yes, MessEase has a report abuse feature. Users can easily report any inappropriate content or behavior within the app, ensuring a safe and respectful environment for all users. Administration have access to these reports and can take necessary actions.",
    },
  ];

  // Features data
  const features = [
    {
      icon: <MessageSquare size={24} className="text-cyan-400" />,
      title: "Complaint Management",
      description: "Register and track complaints in real-time",
    },
    {
      icon: <Coffee size={24} className="text-cyan-400" />,
      title: "Mess Menu Updates",
      description: "View and rate daily mess menus",
    },
    {
      icon: <Calendar size={24} className="text-cyan-400" />,
      title: "Meal Planning",
      description: "Plan and customize your meal schedule",
    },
    {
      icon: <CheckCircle size={24} className="text-cyan-400" />,
      title: "Issue Resolution",
      description: "Quick resolution of hostel-related issues",
    },
  ];

  // Process steps data
  const processSteps = [
    {
      title: "Login/Sign-Up",
      desc: "Access tailored services based on your role with secure authentication",
      icon: "👤",
    },
    {
      title: "Dashboard",
      desc: "Manage complaints and view daily updates all from one centralized location",
      icon: "📊",
    },
    {
      title: "Interaction",
      desc: "Update menus, register issues, and communicate with management efficiently",
      icon: "🔄",
    },
    {
      title: "Resolution",
      desc: "Resolve issues and track progress with comprehensive reporting tools",
      icon: "✅",
    },
  ];

  return (
    <div className="font-sans text-gray-200 bg-gray-900 overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .animate-in {
          animation-duration: 0.8s;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .fade-in-up {
          animation-name: fadeInUp;
        }

        .fade-in-left {
          animation-name: fadeInLeft;
        }

        .fade-in-right {
          animation-name: fadeInRight;
        }

        .zoom-in {
          animation-name: zoomIn;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        /* Section transition effect */
        section {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* Parallax effects */
        .parallax {
          transform: translateY(var(--parallax-offset));
          transition: transform 0.2s ease-out;
        }
      `}</style>

      {/*Header*/}
      <header className="fixed w-full z-50 transition-all duration-300 bg-gray-900/95 backdrop-blur-sm shadow-lg shadow-cyan-900/20 border-b border-gray-800/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo with hover effect */}
            <div
              className="flex items-center group cursor-pointer"
              onClick={() => scrollToSection("hero")}
            >
              <div className="transform transition-transform duration-300 group-hover:scale-110 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-lg -z-10 blur-lg"></div>
                <Logo />
              </div>
            </div>

            {/* Desktop Navigation with enhanced hover effects */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="relative group py-2 outline-none"
                >
                  <span
                    className={`
                  ${activeSection === section ? "text-cyan-400" : "text-gray-300"} 
                  font-medium tracking-wide transition-colors duration-300 group-hover:text-cyan-300
                `}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </span>
                  <span
                    className={`
                  absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full 
                  transform transition-all duration-300 
                  ${activeSection === section ? "scale-x-100" : "scale-x-0"} 
                  group-hover:scale-x-100 opacity-80
                `}
                  ></span>
                </button>
              ))}

              {/* CTA Button */}
              <button
                className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
                onClick={() => navigate("/student/login")}
              >
                Get Started
              </button>
            </nav>

            {/* Mobile Menu Button with animation */}
            <button
              className="md:hidden text-gray-200 focus:outline-none transition-transform duration-300 active:scale-90 z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "rotate-45 top-3" : "rotate-0 top-1"}`}
                ></span>
                <span
                  className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"} top-3`}
                ></span>
                <span
                  className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 top-3" : "rotate-0 top-5"}`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation with improved slide and fade animations */}
        <div
          className={`md:hidden fixed bg-gray-900/95 backdrop-blur-md flex flex-col justify-center items-center transition-all duration-500 ease-in-out z-40 ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col items-center space-y-6 p-8 w-full max-w-md">
            {navItems.map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="relative w-full text-center py-3 outline-none"
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                  transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
                  opacity: isMenuOpen ? 1 : 0,
                  transition: "transform 0.4s ease, opacity 0.4s ease",
                }}
              >
                <span
                  className={`
                text-xl font-medium ${activeSection === section ? "text-cyan-400" : "text-gray-200"}
                transition-colors duration-300
              `}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
                <span
                  className={`
                absolute bottom-0 left-1/2 w-12 h-0.5 bg-cyan-400 rounded-full 
                transform -translate-x-1/2 transition-all duration-300 
                ${activeSection === section ? "scale-x-100" : "scale-x-0"}
              `}
                ></span>
              </button>
            ))}

            {/* Mobile CTA Button */}
            <button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 px-6 rounded-lg mt-6 transition-all duration-300"
              style={{
                transitionDelay: isMenuOpen
                  ? `${navItems.length * 50 + 50}ms`
                  : "0ms",
                transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
                opacity: isMenuOpen ? 1 : 0,
                transition: "transform 0.4s ease, opacity 0.4s ease",
              }}
              onClick={() => navigate("/student/login")}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section with side by side animations */}
      <section
        id="hero"
        className="pt-32 pb-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600 rounded-full opacity-10 blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          ></div>
          <div
            className="absolute top-80 -left-20 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl"
            style={{ transform: `translateY(${scrollY * -0.03}px)` }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600 rounded-full opacity-10 blur-3xl"
            style={{ transform: `translateY(${scrollY * -0.02}px)` }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            {/* Text content with improved styling */}
            <div className="md:w-1/2 mb-10 md:mb-0">
              <span className="inline-block px-4 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-sm font-medium mb-10 animate-on-scroll animate-in fade-in-left">
                Student Hostel Management System
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight animate-on-scroll animate-in fade-in-left">
                Welcome to{" "}
                <span className="text-cyan-400 relative">
                  <TextPressure
                    text="MessEase"
                    flex={true}
                    alpha={false}
                    stroke={false}
                    width={true}
                    weight={true}
                    italic={true}
                    textColor="#ffffff"
                    strokeColor="#ff0000"
                    minFontSize={20}
                  />
                  {/* <SplitText
                    text="MessEase"
                    className="text-7xl font-semibold text-center"
                    delay={150}
                    animationFrom={{
                      opacity: 0,
                      transform: "translate3d(0,50px,0)",
                    }}
                    animationTo={{
                      opacity: 1,
                      transform: "translate3d(0,0,0)",
                    }}
                    easing="easeOutCubic"
                    threshold={0.2}
                    rootMargin="-50px"
                  /> */}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400/50 transform -translate-y-1"></span>
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-300 mb-20 animate-on-scroll animate-in fade-in-left delay-100">
                Simplifying Hostel & Mess Management
              </h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg animate-on-scroll animate-in fade-in-left delay-200">
                Effortlessly manage hostel accommodations, mess menus, and daily
                operations with our comprehensive platform designed specifically
                for campus living.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-on-scroll animate-in fade-in-up delay-300">
                <button
                  onClick={() => scrollToSection("about")}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-600/20 transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Learn More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/student/signup")}
                  className="border border-cyan-500 text-cyan-400 hover:bg-cyan-900/30 px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Side by side animations */}
            <div className="md:w-1/2 animate-on-scroll animate-in fade-in-right delay-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* First animation */}
                <div className="sm:w-1/2 bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 transform transition-all duration-500 hover:scale-105">
                  <LottieAnimation
                    src="https://lottie.host/e659e48b-2dec-4356-84b9-d8f9605ed169/njNElwCyon.lottie"
                    speed={0.8}
                    className="w-full"
                  />
                </div>

                {/* Second animation */}
                <div className="sm:w-1/2 bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 transform transition-all duration-500 hover:scale-105">
                  <LottieAnimation
                    src="https://lottie.host/bcbd4b9c-b636-4ef9-8a11-33affa7600df/iR5P2llRCm.lottie"
                    speed={0.8}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login/Signup Section with card hover effects and distant animation */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Lottie Animation on the left with more distance */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start animate-on-scroll animate-in fade-in-left">
              <div className="relative w-72 h-72">
                <LottieAnimation
                  src="https://lottie.host/8d173c30-5add-44e5-a635-c7cd18248285/gpVym5QTQw.lottie"
                  speed={0.8}
                  className="absolute inset-0"
                />
              </div>
            </div>

            {/* Content card on the right with more distance */}
            <div className="w-full md:w-1/2">
              {/* <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700 backdrop-blur-sm bg-opacity-80 transform hover:shadow-xl hover:shadow-cyan-900/30 transition-all duration-500 animate-on-scroll animate-in zoom-in"> */}
              <SpotlightCard
                className="bg-blue-900"
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-center mb-6 text-white animate-on-scroll animate-in fade-in-up">
                    Ready to Get Started?
                  </h3>
                  <p className="text-center text-gray-400 mb-8 animate-on-scroll animate-in fade-in-up delay-100">
                    Select your role to login or create a new account
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    {/* Student Card */}
                    <div className="bg-gray-800/70 p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700/50 animate-on-scroll animate-in fade-in-left delay-200 group">
                      <div className="flex items-center justify-center h-16 w-16 mx-auto mb-4 rounded-full bg-cyan-900/30 text-cyan-400 group-hover:bg-cyan-800/50 transition-all duration-300">
                        <User size={32} />
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-white">
                        Student
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Access mess menus, register complaints, and rate meals
                      </p>
                      <button
                        onClick={() => handleAuth("student")}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 w-full hover:shadow-lg hover:shadow-cyan-600/20 group-hover:translate-y-1"
                      >
                        Student Login
                      </button>
                    </div>

                    {/* Admin Card */}
                    <div className="bg-gray-800/70 p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700/50 animate-on-scroll animate-in fade-in-right delay-200 group">
                      <div className="flex items-center justify-center h-16 w-16 mx-auto mb-4 rounded-full bg-cyan-900/30 text-cyan-400 group-hover:bg-cyan-800/50 transition-all duration-300">
                        <Users size={32} />
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-white">
                        Administrator
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Manage hostels, resolve complaints, and update menus
                      </p>
                      <button
                        onClick={() => handleAuth("admin")}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 w-full hover:shadow-lg hover:shadow-cyan-600/20 group-hover:translate-y-1"
                      >
                        Admin Login
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 text-center text-gray-500 text-sm animate-on-scroll animate-in fade-in-up delay-300">
                    <p>
                      Having trouble logging in?{" "}
                      <a
                        href="#"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Get help
                      </a>
                    </p>
                  </div>
                </div>
                {/* </div> */}
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with staggered animations */}
      <section
        id="about"
        className="py-16 bg-gray-900 relative overflow-hidden"
      >
        {/* Animated background element */}
        <div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 800) * 0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                About MessEase
              </GradientText>
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              A comprehensive platform designed to streamline hostel and mess
              management for students, accountants, professors, and
              administrative staff.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0 animate-on-scroll animate-in fade-in-left">
              <LottieAnimation
                src="https://lottie.host/e659e48b-2dec-4356-84b9-d8f9605ed169/njNElwCyon.lottie"
                speed={0.8}
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h3 className="text-2xl font-semibold mb-4 text-white animate-on-scroll animate-in fade-in-right">
                Our Mission
              </h3>
              <p className="text-gray-400 mb-6 animate-on-scroll animate-in fade-in-right delay-100">
                Our mission is to enhance the campus living experience by
                simplifying complaint resolution, daily orders, meal ratings,
                and overall communication between students and staff.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white animate-on-scroll animate-in fade-in-right delay-200">
                Key Benefits
              </h3>
              <ul className="space-y-3">
                {[
                  "User-specific dashboards",
                  "Real-time complaint tracking",
                  "Interactive mess menus",
                  "Detailed expense analytics",
                ].map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start animate-on-scroll animate-in fade-in-right"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <CheckCircle
                      className="text-cyan-400 mr-2 mt-1 flex-shrink-0"
                      size={20}
                    />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with hover effects and staggered animations */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 1400) * 0.08}px)` }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 1600) * -0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Features & How It Works
              </GradientText>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6 rounded-full animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-300 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200 text-lg">
              Discover how MessEase simplifies hostel and mess management with
              these powerful features designed for your comfort.
            </p>
          </div>

          {/* Features cards with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg transform transition-all duration-500 
              hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/30 border border-gray-700/50 
              hover:border-cyan-500/30 animate-on-scroll animate-in fade-in-up group"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div
                  className="bg-gray-900/80 p-4 rounded-lg inline-block mb-5 transform transition-all duration-300 
              group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:text-cyan-300"
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Improved How It Works Section */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-center mb-4 text-white animate-on-scroll animate-in fade-in-up">
                How It Works
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6 rounded-full animate-on-scroll animate-in zoom-in delay-100"></div>
              <p className="text-gray-300 max-w-2xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
                Our streamlined process makes managing your hostel and mess
                experience effortless
              </p>
            </div>

            {/* Process steps with connecting lines */}
            <div className="relative mt-16">
              {/* Main connector line */}
              <div
                className="hidden md:block absolute left-8 right-8 top-24 h-1.5 bg-gradient-to-r from-cyan-800 via-cyan-600 to-cyan-800 
  rounded-full z-0 animate-on-scroll animate-in slide-in-from-left opacity-60"
              ></div>

              <div className="flex flex-col md:flex-row justify-between relative z-10">
                {processSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center mb-12 md:mb-0 animate-on-scroll animate-in fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.15}s` }}
                  >
                    <div className="group relative">
                      {/* Step number bubble */}
                      <div
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center 
          justify-center font-bold text-2xl mb-6 shadow-lg shadow-cyan-600/20 transform transition-all 
          duration-300 hover:scale-110 group-hover:shadow-cyan-500/50 z-10 border-4 border-gray-900"
                      >
                        {index + 1}
                      </div>

                      {/* Icon bubble */}
                      <div
                        className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gray-900 border-2 border-gray-700 
          flex items-center justify-center text-lg transform transition-all duration-300 
          group-hover:scale-110 group-hover:border-cyan-400 z-20"
                      >
                        {step.icon}
                      </div>

                      {/* Animated pulse effect */}
                      <div
                        className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-0 
          group-hover:opacity-40 duration-1000 z-0"
                      ></div>

                      {/* Vertical connector dots on mobile */}
                      {index < processSteps.length - 1 && (
                        <div className="md:hidden absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                          <div className="w-1 h-1 rounded-full bg-cyan-500 mb-1"></div>
                          <div className="w-1 h-1 rounded-full bg-cyan-500 mb-1"></div>
                          <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                        </div>
                      )}
                    </div>

                    {/* Dotted line connector for desktop */}
                    {index < processSteps.length - 1 && (
                      <div
                        className="hidden md:block absolute top-24 h-px bg-gradient-to-r from-cyan-500 to-transparent 
          w-full left-1/2 z-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(6, 182, 212, 0.5) 50%, transparent 50%)",
                          backgroundSize: "12px 1px",
                        }}
                      ></div>
                    )}

                    <h4 className="text-xl font-semibold mb-3 text-white">
                      {step.title}
                    </h4>
                    <p className="text-gray-400 text-center max-w-xs px-4 group-hover:text-gray-300 transition-colors duration-300">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Animated dots along the main line */}
              <div className="hidden md:flex absolute top-24 left-0 right-0 justify-between px-20 z-10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-16 text-center animate-on-scroll animate-in fade-in-up">
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 
                hover:shadow-lg hover:shadow-cyan-500/30"
                onClick={() => navigate("/student/login")}
              >
                <p>Get Started Now</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section with hover effects and masonry layout */}
      <section
        id="screenshots"
        className="py-16 bg-gray-900 relative overflow-hidden"
      >
        {/* Animated background element */}
        <div
          className="absolute bottom-0 left-20 w-80 h-80 bg-purple-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 2000) * -0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Screenshots & Preview
              </GradientText>
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              Take a peek at the MessEase interface and experience the
              simplicity of our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              "Student Dashboard",
              "Complaint Registration",
              "Mess Menu Updates",
              "Elections Panel",
              "Pay Hostel/Mess Fee",
              "Group Chat",
            ].map((screen, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 animate-on-scroll animate-in fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="overflow-hidden">
                  <img
                    src={`/assets/${index + 1}00.png`}
                    alt={screen}
                    className="w-full h-64 object-cover transform transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {screen}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {index === 0 &&
                      "Personalized view with quick access to all features."}
                    {index === 1 &&
                      "Simple form to register and track complaints."}
                    {index === 2 && "Daily mess menu with rating options."}
                    {index === 3 &&
                      "Student Elections for mess representatives."}
                    {index === 4 &&
                      "Pay your hostel or mess fee through the portal and download receipt."}
                    {index === 5 &&
                      "Chat with your hostel mates and participate in active polls."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with accordion animation and side animation */}
      <section id="faq" className="py-16 bg-gray-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 2600) * 0.03}px)` }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 2800) * 0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between">
            {/* FAQ Content */}
            <div className="lg:w-3/5">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
                  <GradientText
                    colors={[
                      "#40ffaa",
                      "#4079ff",
                      "#40ffaa",
                      "#4079ff",
                      "#40ffaa",
                    ]}
                    animationSpeed={3}
                    showBorder={false}
                    className="custom-class"
                  >
                    Frequently Asked Questions
                  </GradientText>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
                <p className="text-gray-300 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
                  Find answers to common questions about MessEase.
                </p>
              </div>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="mb-6 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/20 animate-on-scroll animate-in fade-in-up"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-5 bg-gray-750 flex justify-between items-center group transition-all duration-300 hover:bg-gray-700"
                  >
                    <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {faq.question}
                    </h3>
                    <span
                      className={`text-cyan-500 transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out bg-gray-800 ${
                      activeFaq === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="p-5 text-gray-300">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lottie Animation to the right */}
            <div className="lg:w-2/5 flex justify-center lg:justify-end animate-on-scroll animate-in fade-in-right">
              <div className="relative w-full max-w-sm lg:max-w-md transform transition-all duration-500 hover:scale-105">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-lg">
                  <LottieAnimation
                    src="https://lottie.host/b483bd3a-4067-45ff-85a9-754561f7093e/Elh3THO6lA.lottie"
                    speed={0.8}
                    className="w-full"
                  />
                </div>

                {/* Decorative elements around animation */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-lg"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500/20 rounded-full blur-lg"></div>
              </div>
            </div>
          </div>

          {/* Optional: Additional help link */}
          <div className="text-center mt-12 animate-on-scroll animate-in fade-in-up delay-500">
            <p className="text-gray-400">
              Still have questions?{" "}
              <a
                href="#contact"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Contact us
              </a>{" "}
              for more information.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section with enhanced card animations and design */}
      <section
        id="team"
        className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden"
      >
        {/* Animated background ele</section>ments */}
        <div
          className="absolute top-20 right-0 w-96 h-96 bg-cyan-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 3200) * -0.04}px)` }}
        ></div>
        <div
          className="absolute bottom-10 left-1/4 w-80 h-80 bg-blue-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 3200) * 0.03}px)` }}
        ></div>
        <div
          className="absolute top-40 left-10 w-64 h-64 bg-purple-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateX(${(scrollY - 3200) * 0.02}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-sm font-medium mb-4 animate-on-scroll animate-in fade-in-up">
              Our Talented Team
            </span>
            <h2 className="text-4xl font-bold mb-6 text-white animate-on-scroll animate-in fade-in-up">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                The Minds Behind MessEase
              </GradientText>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-8 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-300 max-w-2xl mx-auto animate-on-scroll animate-in fade-in-up delay-200 text-lg">
              Passionate innovators dedicated to transforming campus dining
              experiences through technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/20 border border-gray-700/50 animate-on-scroll animate-in fade-in-up overflow-hidden"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-xl group-hover:translate-x-5 group-hover:-translate-y-5 transition-all duration-700"></div>

                <div className="relative mb-6 mx-auto w-32 h-32 rounded-full overflow-hidden transform transition-all duration-500 group-hover:scale-105 border-4 border-gray-700/50 shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-2xl font-semibold mb-2 text-white">
                  {member.name}
                </h3>
                <p className="text-cyan-400 mb-4 font-medium">{member.role}</p>

                <div className="flex justify-center space-x-4">
                  {/* Social media icons with improved hover effects */}
                  <a
                    href={member.linked}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300 hover:bg-cyan-600 hover:text-white transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-600/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                    </svg>
                  </a>
                  <a
                    href={member.insta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 hover:text-white transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-600/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300 hover:bg-sky-500 hover:text-white transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href={member.git}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300 hover:bg-gray-100 hover:text-gray-900 transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-100/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with hover effects */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 animate-on-scroll animate-in fade-in-left">
              <div className="flex items-center space-x-2 transform transition-all duration-500 hover:scale-105">
                <Logo />
              </div>
              <p className="mt-2 text-gray-400">
                Simplifying Hostel & Mess Management
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 animate-on-scroll animate-in fade-in-right">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button
                      onClick={() => scrollToSection("about")}
                      className="hover:text-cyan-400 transform transition-all duration-300 hover:translate-x-1"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="hover:text-cyan-400 transform transition-all duration-300 hover:translate-x-1"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="hover:text-cyan-400 transform transition-all duration-300 hover:translate-x-1"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transform transition-all duration-300 hover:translate-x-1"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transform transition-all duration-300 hover:translate-x-1"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} MessEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll indicator */}
      <div
        className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-600/30 cursor-pointer transform hover:scale-110 transition-all duration-300 z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          opacity: scrollY > 300 ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default HomePage;
