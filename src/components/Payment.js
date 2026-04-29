import React, { useState } from "react";
import { motion } from "framer-motion";

function Payment({
  selectedParkingLot,
  selectedSlot,
  selectedDuration,
  setSelectedDuration,
  reservationStatus,
  setReservationStatus,
  paymentStatus,
  setPaymentStatus,
  setMockHistoryData,
  walletBalance,
  setWalletBalance,
  mockHistoryData,
  setActiveTab,
  bookingData,
  updateParkingLotAvailability,
  user,
  passDiscount,
}) {
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [partialPayment, setPartialPayment] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const calculateAmount = () => {
    const baseAmount = selectedParkingLot.price * selectedDuration;
    const discount = passDiscount / 100;
    return partialPayment ? baseAmount * 0.3 : baseAmount * (1 - discount);
  };

  const handlePayment = () => {
    if (!selectedParkingLot || selectedSlot === null || !bookingData) {
      setPaymentError("Missing booking info!");
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    const amount = calculateAmount();

    if (walletBalance >= amount) {
      const newTransaction = {
        id: Date.now(),
        location: selectedParkingLot.name,
        amount: amount,
        status: "Active",
        time: new Date().toLocaleString(),
        paymentMethod: selectedPaymentMethod === "upi" ? "UPI" : "Card",
        slotNumber: `A${selectedSlot + 1}`,
        coordinates: selectedParkingLot.coordinates,
        vehicleNumber: bookingData.vehicleNumber,
        userName: bookingData.userName,
        parking_lot_id: selectedParkingLot.id,
        parking_lot_name: selectedParkingLot.name,
      };

      setWalletBalance((prev) => prev - amount);
      setMockHistoryData((prev) => ({
        ...prev,
        ongoing: [...prev.ongoing, newTransaction],
      }));
      updateParkingLotAvailability(selectedParkingLot.id);
      setPaymentStatus(partialPayment ? "partial" : "full");
      setReservationStatus("confirmed");
      setShowPaymentQR(false);
      handlePaymentSuccess(newTransaction);
    } else {
      setPaymentError("Not enough money in wallet! Add more.");
    }
    setPaymentProcessing(false);
  };

  const handlePaymentSuccess = (transaction) => {
    setCurrentBooking({
      id: transaction.id,
      parkingLot: selectedParkingLot,
      slot: selectedSlot,
      duration: selectedDuration,
      amount: transaction.amount,
      paymentMethod: selectedPaymentMethod,
      time: transaction.time,
      qrCode: `PARK-${transaction.id}`,
      status: "active",
    });
    setShowReceiptModal(true);
  };

  const downloadReceipt = () => {
    if (!currentBooking) return;

    const receiptContent = `
      ParkWise Receipt
      ----------------
      Booking ID: ${currentBooking.id}
      Location: ${currentBooking.parkingLot.name}
      Slot: A${currentBooking.slot + 1}
      Duration: ${currentBooking.duration} hours
      Amount: ₹${currentBooking.amount.toFixed(2)}
      Time: ${currentBooking.time}
      Status: ${currentBooking.status}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parkwise-receipt-${currentBooking.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const navigateToLocation = () => {
    if (!currentBooking || !currentBooking.parkingLot.coordinates) {
      console.error("Missing booking or coordinates");
      alert("Unable to navigate: Booking details are incomplete.");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setShowNavigation(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Couldn’t get your location. Using default starting point.");
          setCurrentLocation(null); // Use default in iframe
          setShowNavigation(true);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation not supported");
      alert("Your browser doesn’t support location services. Using default starting point.");
      setCurrentLocation(null);
      setShowNavigation(true);
    }
  };

  const NavigationWindow = () => {
    if (!currentBooking || !currentBooking.parkingLot.coordinates) return null;

    const origin = currentLocation
      ? `${currentLocation.lat},${currentLocation.lng}`
      : "19.2183,72.9781"; // Default to Mumbai if no current location
    const destination = `${currentBooking.parkingLot.coordinates.lat},${currentBooking.parkingLot.coordinates.lng}`;
    const directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;

    return (
      <motion.div
        className={`fixed ${isMinimized ? "bottom-4 right-4 w-64 h-16" : "inset-0 bg-black bg-opacity-50 flex items-center justify-center"} z-50`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`bg-[#1A1A1A] rounded-xl ${isMinimized ? "p-2" : "p-8 w-full max-w-3xl"}`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isMinimized ? (
            <div className="flex justify-between items-center">
              <span className="text-white">Navigation to {currentBooking.parkingLot.name}</span>
              <motion.button
                onClick={() => setIsMinimized(false)}
                className="text-[#FFD60A]"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-expand"></i>
              </motion.button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Navigate to {currentBooking.parkingLot.name}</h3>
                <div className="space-x-2">
                  <motion.button
                    onClick={() => setIsMinimized(true)}
                    className="text-[#FFD60A]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <i className="fas fa-minus"></i>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowNavigation(false)}
                    className="text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <i className="fas fa-times"></i>
                  </motion.button>
                </div>
              </div>
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0 }}
                src={directionsUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        <motion.button
          onClick={() => setActiveTab("slots")}
          className="text-[#7B61FF] hover:text-[#5B3FD1] transition-colors"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </motion.button>
      </div>
      <motion.div
        className="p-6 bg-[#2C2C2E] rounded-2xl shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-semibold text-xl mb-4">Booking Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Location</p>
            <p className="text-white font-medium">{selectedParkingLot.name}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Rate</p>
            <p className="text-white font-medium">₹{selectedParkingLot.price}/hour</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Duration</p>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => selectedDuration > 1 && setSelectedDuration((d) => d - 1)}
                className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2D2D2D] transition-colors"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-minus text-[#FFD60A]"></i>
              </motion.button>
              <span className="text-white font-medium w-8 text-center">{selectedDuration}</span>
              <motion.button
                onClick={() => setSelectedDuration((d) => d + 1)}
                className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2D2D2D] transition-colors"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-plus text-[#FFD60A]"></i>
              </motion.button>
              <span className="text-gray-300">hours</span>
            </div>
          </div>
          <div className="border-t border-[#3C3C3E] pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-white font-medium">Total Amount</p>
              <p className="text-[#FFD60A] text-2xl font-bold">₹{calculateAmount().toFixed(2)}</p>
            </div>
            {passDiscount > 0 && !partialPayment && (
              <p className="text-sm text-gray-400">({passDiscount}% off with Park Card)</p>
            )}
          </div>
        </div>
      </motion.div>

      {!showPaymentQR ? (
        <motion.div
          className="p-6 bg-[#2C2C2E] rounded-2xl shadow-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="font-semibold text-xl mb-6">Payment Method</h3>
          <div className="space-y-4">
            <motion.div
              onClick={() => {
                setPartialPayment(false);
                setSelectedPaymentMethod("wallet");
                setShowPaymentQR(true);
              }}
              className="cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border border-[#FFD60A] rounded-xl hover:bg-[#1C1C1E] transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1C1C1E] rounded-lg flex items-center justify-center">
                      <i className="fas fa-wallet text-[#FFD60A] text-2xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold">Wallet Payment</p>
                      <p className="text-sm text-gray-400">Balance: ₹{walletBalance}</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </div>
            </motion.div>

            <motion.div
              onClick={() => {
                setPartialPayment(false);
                setSelectedPaymentMethod("upi");
                setShowPaymentQR(true);
              }}
              className="cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border border-[#3C3C3E] rounded-xl hover:bg-[#1C1C1E] transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1C1C1E] rounded-lg flex items-center justify-center">
                      <i className="fas fa-qrcode text-[#FFD60A] text-2xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold">UPI Payment</p>
                      <p className="text-sm text-gray-400">Pay via UPI app</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </div>
            </motion.div>

            <motion.div
              onClick={() => {
                setPartialPayment(true);
                setSelectedPaymentMethod("upi");
                setShowPaymentQR(true);
              }}
              className="cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border border-[#3C3C3E] rounded-xl hover:bg-[#1C1C1E] transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Partial Payment</p>
                    <p className="text-sm text-gray-400">Pay 30% now, rest at location</p>
                  </div>
                  <p className="text-[#FFD60A] font-medium">₹{(selectedParkingLot.price * selectedDuration * 0.3).toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="p-6 bg-[#2C2C2E] rounded-2xl shadow-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {selectedPaymentMethod === "upi" ? (
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-6">Scan QR to Pay</h3>
              <motion.div
                className="bg-white p-8 rounded-xl mb-6 mx-auto max-w-[240px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-qrcode text-8xl text-black"></i>
              </motion.div>
              <p className="text-lg font-medium mb-2">Amount: ₹{calculateAmount().toFixed(2)}</p>
              <p className="text-sm text-gray-400">Scan with any UPI app</p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-6">Pay with Wallet</h3>
              <p className="text-lg font-medium mb-2">Amount: ₹{calculateAmount().toFixed(2)}</p>
              <p className="text-sm text-gray-400">Balance: ₹{walletBalance}</p>
            </div>
          )}
          <div className="mt-6">
            {paymentProcessing ? (
              <motion.div
                className="flex items-center justify-center py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Processing payment...</span>
              </motion.div>
            ) : (
              <motion.button
                onClick={handlePayment}
                className="w-full py-4 bg-gradient-to-r from-[#FFD60A] to-[#FF9900] text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Pay ₹{calculateAmount().toFixed(2)}
              </motion.button>
            )}
            {paymentError && (
              <motion.p
                className="text-red-500 text-center mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {paymentError}
              </motion.p>
            )}
            <motion.button
              onClick={() => {
                setShowPaymentQR(false);
                setSelectedPaymentMethod(null);
              }}
              className="w-full mt-3 py-4 bg-[#1C1C1E] text-white rounded-xl font-semibold hover:bg-[#2D2D2D] transition-colors"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {showReceiptModal && currentBooking && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#1A1A1A] p-8 rounded-xl w-full max-w-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg inline-block mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-check-circle mr-2"></i>
                Booking Confirmed
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-xl mb-6 mx-auto max-w-[200px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentBooking.qrCode}`}
                  alt="Parking QR Code"
                  className="w-full"
                />
              </motion.div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID</span>
                <span>{currentBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span>{currentBooking.parkingLot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slot</span>
                <span>A{currentBooking.slot + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-[#FFD60A]">₹{currentBooking.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={downloadReceipt}
                className="w-full py-3 bg-[#2C2C2E] text-white rounded-xl hover:bg-[#3C3C3E] transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-download mr-2"></i>
                Download Receipt
              </motion.button>
              <motion.button
                onClick={navigateToLocation}
                className="w-full py-3 bg-[#7B61FF] text-white rounded-xl hover:bg-[#5B3FD1] transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-map-marker-alt mr-2"></i>
                Navigate to Spot
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowReceiptModal(false);
                  setActiveTab("slots");
                  setShowPaymentQR(false);
                  setSelectedPaymentMethod(null);
                }}
                className="w-full py-3 bg-[#1C1C1E] text-gray-400 rounded-xl hover:bg-[#2C2C2E]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showNavigation && <NavigationWindow />}
    </motion.div>
  );
}

export default Payment;