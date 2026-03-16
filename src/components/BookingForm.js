import React, { useState } from "react";
import { motion } from "framer-motion";

function BookingForm({
  selectedParkingLot,
  selectedSlot,
  setActiveTab,
  onBookingConfirmed,
}) {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    userName: "",
    email: "",
    contactNumber: "",
  });
  const [otpMethod, setOtpMethod] = useState(null);
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(null);
  const [otpError, setOtpError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = () => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setSentOtp(generatedOtp);
    alert(`Your OTP is ${generatedOtp} (sent to your ${otpMethod})`);
    setOtpError(null);
    console.log("OTP sent. Form data:", formData);
    console.log("Selected slot in BookingForm:", selectedSlot);
  };

  const validateOtp = () => {
    if (otp === sentOtp) {
      console.log("OTP confirmed! Sending form data:", formData);
      console.log("Selected slot before sending:", selectedSlot);
      onBookingConfirmed(formData);
    } else {
      setOtpError("Wrong OTP! Try again.");
      console.log("OTP validation failed");
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Enter Your Details</h2>
        <motion.button
          onClick={() => setActiveTab("slots")}
          className="text-[#7B61FF] hover:text-[#5B3FD1] transition-colors"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Slots
        </motion.button>
      </div>

      <motion.div
        className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-semibold text-xl mb-4">Booking Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Vehicle Number</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              placeholder="DL 01 AB 1234"
              className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="9876543210"
              className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
            />
          </div>
        </div>

        {!otpMethod && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-300 mb-2">How do you want your OTP?</p>
            <div className="flex gap-4">
              <motion.button
                onClick={() => {
                  setOtpMethod("email");
                  sendOtp();
                }}
                className="bg-[#7B61FF] text-white px-4 py-2 rounded-xl hover:bg-[#5B3FD1]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Email
              </motion.button>
              <motion.button
                onClick={() => {
                  setOtpMethod("phone");
                  sendOtp();
                }}
                className="bg-[#7B61FF] text-white px-4 py-2 rounded-xl hover:bg-[#5B3FD1]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Phone
              </motion.button>
            </div>
          </motion.div>
        )}

        {otpMethod && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm text-gray-400 mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="1234"
              className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
            />
            {otpError && <p className="text-red-500 mt-2">{otpError}</p>}
            <motion.button
              onClick={validateOtp}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#FFD60A] to-[#FF9900] text-black rounded-xl font-semibold hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Confirm OTP
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default BookingForm;