import React, { useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import useHostelCheck from "../../hooks/useHostelCheck";

const HelpCenterPage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { loadingCheck } = useHostelCheck();

  const helpCategories = [
    {
      id: 1,
      title: "Getting Started",
      icon: "🚀",
      faqs: [
        {
          question: "How do I create my profile?",
          answer:
            "Visit the Profile section and fill in your personal details including name, email, roll number, branch, and year. Make sure all information is accurate as it will be used for hostel management.",
        },
        {
          question: "What is the verification process?",
          answer:
            "After registration, you need to verify your college email. Check your inbox for a verification link and click it to complete the process.",
        },
        {
          question: "How do I reset my password?",
          answer:
            "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your email to reset your password.",
        },
      ],
    },
    {
      id: 2,
      title: "Elections",
      icon: "🗳️",
      faqs: [
        {
          question: "How do I vote in hostel elections?",
          answer:
            "Go to the Elections section, view active elections, and click 'Vote Now'. Select your preferred candidate and submit your vote. Each student can vote only once per election.",
        },
        {
          question: "Can I change my vote?",
          answer:
            "No, once you submit your vote, it cannot be changed or revoked. Please vote carefully.",
        },
        {
          question: "When are election results announced?",
          answer:
            "Results are typically announced within 24 hours after the voting period ends. You will receive a notification when results are available.",
        },
        {
          question: "How can I apply as a candidate?",
          answer:
            "During the application phase of an election, visit the Elections page and click 'Apply'. Fill in your details and submit your application before the deadline.",
        },
      ],
    },
    {
      id: 3,
      title: "Fees & Payments",
      icon: "💳",
      faqs: [
        {
          question: "When are fees due?",
          answer:
            "Hostel fees are typically due at the beginning of each month. Check the Fees section for the exact due dates.",
        },
        {
          question: "How do I pay my fees?",
          answer:
            "Go to Fees section, select the outstanding payment, and click 'Pay Now'. You can pay using Razorpay with various payment methods including cards, UPI, and wallets.",
        },
        {
          question: "Can I get a fee receipt?",
          answer:
            "Yes, after successful payment, a receipt is automatically generated. You can download it as a PDF from the Fees section.",
        },
        {
          question: "What if I miss the fee payment deadline?",
          answer:
            "Late fees may be applied. Contact the hostel admin to discuss payment options and possible extensions.",
        },
      ],
    },
    {
      id: 4,
      title: "Mess Management",
      icon: "🍽️",
      faqs: [
        {
          question: "How do I view the mess menu?",
          answer:
            "Go to the Mess section and click on 'Menu'. You can view the weekly menu with breakfast, lunch, and dinner options.",
        },
        {
          question: "Can I file a complaint about meals?",
          answer:
            "Yes, use the Complaints section to file a complaint about meal quality or service. Include details and your complaint will be reviewed by the mess manager.",
        },
        {
          question: "How do I opt-out of the mess?",
          answer:
            "Contact the hostel admin directly to discuss opting out. Any applicable refunds will be processed according to hostel policy.",
        },
      ],
    },
    {
      id: 5,
      title: "Guest Rooms & Hostels",
      icon: "🏠",
      faqs: [
        {
          question: "How do I book a guest room?",
          answer:
            "Go to Guest Rooms section, select available dates, and complete the booking. You'll receive a confirmation and can track your booking status.",
        },
        {
          question: "What are the guest room charges?",
          answer:
            "Guest room charges vary by hostel. Check the hostel details page for a breakdown of daily rates and amenities included.",
        },
        {
          question: "Can I cancel my guest room booking?",
          answer:
            "Cancellations are allowed up to 24 hours before the booking date. A cancellation fee may apply depending on the hostel policy.",
        },
        {
          question: "How many guests can stay in a guest room?",
          answer:
            "Guest room capacity varies. Check the specific room details when booking. Typically, rooms accommodate 1-2 guests.",
        },
      ],
    },
    {
      id: 6,
      title: "Complaints & Support",
      icon: "🆘",
      faqs: [
        {
          question: "How do I file a complaint?",
          answer:
            "Go to Complaints section, select the category (maintenance, mess, behavior, etc.), describe the issue, and submit. You'll receive a ticket number to track progress.",
        },
        {
          question: "How long does it take to resolve complaints?",
          answer:
            "Most complaints are resolved within 3-5 business days. Urgent issues are prioritized.",
        },
        {
          question: "Can I follow up on my complaint?",
          answer:
            "Yes, use your complaint ticket number to check status. You'll also receive notifications when your complaint is resolved.",
        },
      ],
    },
    {
      id: 7,
      title: "Academic & Settings",
      icon: "📚",
      faqs: [
        {
          question: "Where can I view my academic calendar?",
          answer:
            "The Calendar section shows important academic dates, exam schedules, and college events.",
        },
        {
          question: "How do I update my profile information?",
          answer:
            "Go to Settings and select 'Edit Profile'. You can update your personal information, contact details, and preferences.",
        },
        {
          question: "How can I change my notification preferences?",
          answer:
            "In Settings, go to Notifications and select which types of notifications you want to receive.",
        },
      ],
    },
  ];

  const filteredCategories = helpCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0 || searchTerm === "");

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-100">
      <Header />
      <div className="max-w-5xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Help Center</h1>
          <p className="text-gray-400">
            Find answers to common questions about MessEase
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-3 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="space-y-4 mb-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all"
            >
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )
                }
                className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-xl font-semibold text-white">
                    {category.title}
                  </h2>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 text-gray-400 transition-transform ${
                    expandedCategory === category.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* FAQs */}
              {expandedCategory === category.id && (
                <div className="border-t border-gray-700 bg-gray-750 p-6">
                  <div className="space-y-4">
                    {category.faqs.map((faq, idx) => (
                      <div key={idx} className="pb-4 last:pb-0">
                        <h3 className="font-semibold text-indigo-300 mb-2 flex items-start">
                          <span className="mr-3 text-lg">❓</span>
                          {faq.question}
                        </h3>
                        <p className="text-gray-300 ml-6 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-xl shadow-xl border border-indigo-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Didn't find your answer?
          </h2>
          <p className="text-indigo-200 mb-4">
            Our support team is here to help. Contact us at
            <a href="mailto:tomarhimanshu520@gmail.com" className="text-white font-semibold hover:text-indigo-300 transition-colors ml-1">
              tomarhimanshu520@gmail.com
            </a>
          </p>
          <a
            href="mailto:tomarhimanshu520@gmail.com"
            className="inline-block px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Contact Support
          </a>
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
      </div>
    </div>
  );
};

export default HelpCenterPage;
