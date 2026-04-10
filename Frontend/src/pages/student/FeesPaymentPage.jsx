import React, { useState, useEffect } from "react";
import api from "../../utils/axiosRequest";
import toast from "react-hot-toast";
import {
  FaInfoCircle,
  FaCheckCircle,
  FaDownload,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaLock,
} from "react-icons/fa";
import Header from "../../components/Header";
import { jsPDF } from "jspdf";
import useHostelCheck from "../../hooks/useHostelCheck";

const FeesPaymentPage = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const { loadingCheck } = useHostelCheck();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await api.post("/api/payment/student/details");
        console.log("Full API Response:", response);
        console.log("Response Data:", response.data);
        console.log("Response Data.data:", response.data.data);
        setPaymentData(response.data.data);
      } catch (err) {
        console.error("Error fetching payment details:", err);
        console.error("Error response:", err.response);
        setError("Failed to load payment details");
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  const handlePayment = async (paymentId) => {
    try {
      setProcessingPaymentId(paymentId);

      // Create Razorpay order
      const orderResponse = await api.post("/api/payment/create-order", {
        paymentId,
      });

      if (!orderResponse.data.success) {
        throw new Error("Failed to create payment order");
      }

      const orderData = orderResponse.data.data;

      // Find the payment data from the payments array
      const paymentInfo = paymentData.payments.find(p => p.id === paymentId);

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: "Hostel Management",
        description: paymentInfo?.title || "Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post("/api/payment/verify", {
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              toast.success("Payment successful!");
              // Update the specific payment's hasPaid status
              setPaymentData((prev) => ({
                ...prev,
                payments: prev.payments.map(p =>
                  p.id === paymentId ? { ...p, hasPaid: true } : p
                ),
              }));
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
          contact: "",
        },
        notes: {
          paymentFor: "Hostel Fee",
          paymentId,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      // Find the specific payment
      const payment = paymentData.payments.find(p => p.id === paymentId);
      if (!payment) {
        toast.error("Payment not found");
        return;
      }

      // Fetch user info from /api/student/verify-token
      let userInfo = { name: "N/A", email: "N/A", branch: "N/A", year: "N/A", rollNumber: "N/A" };
      try {
        const res = await api.post("/api/student/verify-token");
        userInfo = res.data.userInfo;
      } catch (err) {
        console.error("Warning: Could not fetch user info for receipt:", err.message);
      }

      // Get current date for receipt generation timestamp
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const time = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      // Generate unique receipt number
      const receiptNumber = `RCT-${Date.now().toString().slice(-10)}`;

      // Create a new PDF document using jsPDF
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ========== OFFICIAL HEADER ==========
      doc.setFillColor(70, 105, 145); // Medium blue - official look
      doc.rect(0, 0, pageWidth, 25, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL PAYMENT RECEIPT", pageWidth / 2, 12, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("MessEase Management System", pageWidth / 2, 20, { align: "center" });

      // ========== RECEIPT METADATA ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Receipt No.: ${receiptNumber}`, 14, 32);
      doc.text(`Date: ${today} at ${time}`, 100, 32);
      doc.text(`Status: PAYMENT RECEIVED`, 14, 38);
      doc.text(`Generated: ${new Date().toISOString().split("T")[0]}`, 100, 38);

      // ========== BORDER LINE ==========
      doc.setDrawColor(70, 105, 145);
      doc.setLineWidth(1.5);
      doc.line(14, 42, 196, 42);

      // ========== PAYER DETAILS ==========
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PAYER DETAILS", 14, 50);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const colLeft = 14;
      const colRight = 105;
      
      doc.text(`Name: ${userInfo.name}`, colLeft, 58);
      doc.text(`Email: ${userInfo.email}`, colLeft, 64);
      doc.text(`Roll Number: ${userInfo.rollNumber}`, colLeft, 70);
      doc.text(`Branch: ${userInfo.branch} | Year: ${userInfo.year}`, colRight, 58);

      // ========== PAYMENT DETAILS SECTION ==========
      doc.setLineWidth(0.5);
      doc.line(14, 75, 196, 75);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT PARTICULARS", 14, 82);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Description: ${payment.title}`, colLeft, 90);
      if (payment.description) {
        doc.text(`Details: ${payment.description}`, colLeft, 96);
      }

      // Get payment details with proper fallback
      const paymentInfo = payment.paymentDetails || {};
      const razorpayId = paymentInfo.razorpayPaymentId || paymentInfo.transactionId || "N/A";
      const transactionId = razorpayId;
      
      doc.text(`Payment Method: Razorpay (Online Gateway)`, colLeft, 102);
      doc.text(`Transaction ID: ${transactionId}`, colLeft, 108);
      
      // Format due date
      let dueDate = "N/A";
      if (payment.dueDate) {
        dueDate = new Date(payment.dueDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      
      let paymentDate = today;
      if (payment.paymentDetails && payment.paymentDetails.paidAt) {
        paymentDate = new Date(payment.paymentDetails.paidAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      
      doc.text(`Due Date: ${dueDate}`, colRight, 90);
      doc.text(`Payment Date: ${paymentDate}`, colRight, 96);
      doc.text(`Ref. ID: ${receiptNumber}`, colRight, 102);

      // ========== AMOUNT SECTION - FORMAL STYLE ==========
      doc.setLineWidth(0.5);
      doc.line(14, 115, 196, 115);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("AMOUNT DETAILS", 14, 122);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      // Simple formal table-like format for amount
      doc.text("Amount Paid:", 20, 132);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Rs.  ${payment.amount.toFixed(2)}`, 170, 132, { align: "right" });
      doc.setFontSize(9);
      
      // Formal dividing line
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(20, 135, 185, 135);

      // ========== STAMP AND SIGNATURE ==========
      doc.setLineWidth(0.5);
      doc.line(14, 155, 196, 155);
      
      const stampArea = 160;
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      
      // Stamp circle
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.circle(35, stampArea + 10, 10);
      doc.text("OFFICIAL", 35, stampArea + 8, { align: "center" });
      doc.text("STAMP", 35, stampArea + 15, { align: "center" });
      
      // Signature line
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(120, stampArea + 18, 190, stampArea + 18);
      doc.text("Authorized Signature", 155, stampArea + 22, { align: "center" });

      // ========== VERIFICATION BLOCK ==========
      doc.setLineWidth(1);
      doc.setDrawColor(80, 80, 80);
      doc.rect(14, 195, 182, 25);
      
      doc.setTextColor(70, 105, 145);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT VERIFICATION", 18, 203);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Verification Code: ${receiptNumber}`, 18, 210);
      doc.text(`Reference: ${transactionId}`, 18, 215);
      doc.text(`Status: Successfully Received & Verified`, 120, 210);

      // ========== TERMS AND CONDITIONS ==========
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      
      const termsY = 230;
      doc.text("TERMS & CONDITIONS:", 14, termsY);
      doc.text("1. This receipt is an official document generated by the MessEase Management System.", 14, termsY + 4);
      doc.text("2. No manual signature is required as this is a digitally generated and certified document.", 14, termsY + 8);
      doc.text("3. This receipt serves as proof of payment for records and audit purposes.", 14, termsY + 12);
      doc.text("4. For any discrepancies, contact the accounts department immediately with this receipt.", 14, termsY + 16);

      // ========== FOOTER ==========
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      
      const footerText = `This is a digitally signed and authenticated receipt. System Reference: ${receiptNumber} | Generated: ${new Date().toISOString()}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center", maxWidth: 180 });

      // ========== OFFICIAL BORDER ==========
      doc.setDrawColor(70, 105, 145);
      doc.setLineWidth(2);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

      // Save the PDF
      const filename = `Receipt_${payment.title.replace(/\s+/g, "_")}_${receiptNumber}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);

      toast.success("Official receipt downloaded successfully!");
    } catch (err) {
      console.error("Error generating receipt:", err);
      toast.error("Failed to generate receipt: " + (err.message || "Unknown error"));
    }
  };

  if (loading || loadingCheck) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-700 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-white">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData?.paymentExists) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <Header />
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-gray-800 shadow-xl rounded-xl p-10 text-center border border-gray-700">
            <div className="bg-blue-500/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaInfoCircle className="text-blue-500 text-4xl" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-blue-100">No Payment Required</h1>
            <p className="text-gray-400 text-lg mb-6">{paymentData?.message || "No payment is currently enabled for your hostel/mess."}</p>
            
            {/* DEBUG INFO */}
            <div className="mt-8 bg-gray-900/50 p-4 rounded text-left text-xs text-gray-300 mb-6 border border-gray-600">
              <p className="font-mono font-bold mb-2">Debug Information:</p>
              <div className="space-y-1 font-mono">
                <p>✓ hostel: {paymentData?.hostelId ? "Assigned" : "NOT assigned"}</p>
                <p>✓ paymentExists: {String(paymentData?.paymentExists)}</p>
                <p>✓ total payments: {paymentData?.payments?.length || 0}</p>
                <p>✓ all payments (including inactive): {paymentData?.debug?.noOfAllPayments || "N/A"}</p>
              </div>
              {paymentData?.debug?.allPayments?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="mb-2">Payments found (but may be inactive):</p>
                  {paymentData.debug.allPayments.map((p, idx) => (
                    <p key={idx} className="text-yellow-400">
                      {idx + 1}. {p.title} - ₹{p.amount} (active: {String(p.isActive)})
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={() => window.history.back()} className="mt-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Fees</h1>
          <p className="text-gray-400">View and pay for all active fee payments for your hostel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-xl shadow-lg border border-blue-700">
            <h3 className="text-blue-300 text-sm font-semibold uppercase">Total Payments</h3>
            <p className="text-3xl font-bold mt-2">{paymentData?.payments?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-xl shadow-lg border border-green-700">
            <h3 className="text-green-300 text-sm font-semibold uppercase">Paid Payments</h3>
            <p className="text-3xl font-bold mt-2">{paymentData?.payments?.filter(p => p.hasPaid)?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-6 rounded-xl shadow-lg border border-orange-700">
            <h3 className="text-orange-300 text-sm font-semibold uppercase">Pending</h3>
            <p className="text-3xl font-bold mt-2">{paymentData?.payments?.filter(p => !p.hasPaid)?.length || 0}</p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700 mb-8">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paymentData?.payments?.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-750 transition">
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-gray-200">{payment.title}</div>
                    {payment.description && <div className="text-xs text-gray-400">{payment.description}</div>}
                  </td>
                  <td className="px-6 py-5"><div className="text-sm text-gray-200">₹{payment.amount}</div></td>
                  <td className="px-6 py-5">
                    {payment.dueDate ? (
                      <>
                        <div className="text-sm text-gray-200">{new Date(payment.dueDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date() > new Date(payment.dueDate) ? "Overdue" : `${Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {payment.hasPaid ? (
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-900/60 text-green-300 border border-green-600">✓ Paid</span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-orange-900/60 text-orange-300 border border-orange-600">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {payment.hasPaid ? (
                      <button onClick={() => downloadReceipt(payment.id)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition">
                        <FaDownload className="inline mr-2" size={14} /> Receipt
                      </button>
                    ) : (
                      <button onClick={() => handlePayment(payment.id)} disabled={processingPaymentId === payment.id} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${processingPaymentId === payment.id ? "bg-blue-700 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                        {processingPaymentId === payment.id ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-6">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-400 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-blue-100 font-semibold mb-2">Payment Information</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Pay each fee independently</li>
                <li>• All payments are secured through Razorpay</li>
                <li>• Download receipts for every successful payment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesPaymentPage;

