import React, { useState } from "react";
import { motion } from "framer-motion";

function History({ mockHistoryData, setMockHistoryData, setWalletBalance, setMockParkingLots, resetBookingStatus }) {
  const [activeHistoryTab, setActiveHistoryTab] = useState("ongoing");
  const [showDetails, setShowDetails] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleCancelBooking = (booking) => {
    if (window.confirm(`Cancel this booking? You'll get 90% back (₹${(booking.amount * 0.9).toFixed(2)}).`)) {
      const refund = booking.amount * 0.9;
      const cancelledBooking = {
        ...booking,
        status: "Cancelled",
        amount: refund,
        time: new Date().toLocaleString(),
        type: "Refund",
      };

      setMockHistoryData((prev) => ({
        ...prev,
        ongoing: prev.ongoing.filter((b) => b.id !== booking.id),
        cancelled: [...prev.cancelled, cancelledBooking],
      }));
      setWalletBalance((prev) => prev + refund);
      setMockParkingLots((prev) =>
        prev.map((lot) =>
          lot.id === booking.parking_lot_id ? { ...lot, available: lot.available + 1 } : lot
        )
      );
      resetBookingStatus();
    }
  };

  const handleShowDetails = (booking) => setShowDetails(booking);
  const closeDetails = () => setShowDetails(null);

  const navigateToLocation = (booking) => {
    if (!booking.coordinates) {
      console.error("No coordinates available, using default");
      booking.coordinates = { lat: 19.2183, lng: 72.9781 }; // Default to Mumbai
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setShowDetails(booking); // Ensure booking details are set
          setShowNavigation(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Couldn’t get your location. Using default starting point.");
          setCurrentLocation(null); // Use default in iframe
          setShowDetails(booking);
          setShowNavigation(true);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation not supported");
      alert("Your browser doesn’t support location services. Using default starting point.");
      setCurrentLocation(null);
      setShowDetails(booking);
      setShowNavigation(true);
    }
  };

  const NavigationWindow = () => {
    if (!showDetails || !showDetails.coordinates) return null;

    const origin = currentLocation
      ? `${currentLocation.lat},${currentLocation.lng}`
      : "19.2183,72.9781"; // Default to Mumbai
    const destination = `${showDetails.coordinates.lat},${showDetails.coordinates.lng}`;
    const directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD28jw9Rl6bPQgQIauHX_Vm01Ce6eZRhDE&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;

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
              <span className="text-white">Navigation to {showDetails.location}</span>
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
                <h3 className="text-xl font-bold">Navigate to {showDetails.location}</h3>
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
      className="bg-black p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex gap-4 mb-6"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setActiveHistoryTab("ongoing")}
          className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 ${activeHistoryTab === "ongoing" ? "bg-gradient-to-r from-[#7B61FF] to-[#5B3FD1] text-white shadow-lg" : "bg-[#1C1C1E] text-gray-400 hover:bg-[#2C2C2E]"}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          Ongoing
        </motion.button>
        <motion.button
          onClick={() => setActiveHistoryTab("completed")}
          className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 ${activeHistoryTab === "completed" ? "bg-gradient-to-r from-[#7B61FF] to-[#5B3FD1] text-white shadow-lg" : "bg-[#1C1C1E] text-gray-400 hover:bg-[#2C2C2E]"}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          Completed
        </motion.button>
        <motion.button
          onClick={() => setActiveHistoryTab("cancelled")}
          className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 ${activeHistoryTab === "cancelled" ? "bg-gradient-to-r from-[#7B61FF] to-[#5B3FD1] text-white shadow-lg" : "bg-[#1C1C1E] text-gray-400 hover:bg-[#2C2C2E]"}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          Cancelled
        </motion.button>
      </motion.div>

      <div className="space-y-4">
        {mockHistoryData[activeHistoryTab].length === 0 ? (
          <p className="text-gray-400 text-center">No {activeHistoryTab} bookings yet!</p>
        ) : (
          mockHistoryData[activeHistoryTab].map((item) => (
            <motion.div
              key={item.id}
              className="bg-[#1C1C1E] p-6 rounded-2xl border border-[#2C2C2E] hover:border-[#3C3C3E] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFD60A] rounded-xl flex items-center justify-center">
                    <i className="fas fa-parking text-black text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.location}</h3>
                    <p className="text-sm text-gray-400 mb-2">{item.time}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-[#2C2C2E] px-2 py-1 rounded-full">{item.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#FFD60A] font-bold text-lg mb-1">₹{item.amount.toFixed(2)}</p>
                  {activeHistoryTab === "ongoing" && (
                    <div className="space-y-2">
                      <motion.button
                        onClick={() => handleCancelBooking(item)}
                        className="text-red-400 hover:text-red-500 transition-colors block"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => handleShowDetails(item)}
                        className="text-[#7B61FF] hover:text-[#5B3FD1] transition-colors block"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        Details
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showDetails && (
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
            <h3 className="text-xl font-bold mb-4">Booking Details</h3>
            <div className="text-center mb-6">
              <div className="bg-white p-8 rounded-xl mb-6 mx-auto max-w-[200px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PARK-${showDetails.id}`}
                  alt="Parking QR Code"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID</span>
                <span>{showDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span>{showDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slot</span>
                <span>{showDetails.slotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-[#FFD60A]">₹{showDetails.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span>{showDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span>{showDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vehicle Number</span>
                <span>{showDetails.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Name</span>
                <span>{showDetails.userName}</span>
              </div>
            </div>
            <div className="space-y-3">
              <motion.button
                onClick={() => navigateToLocation(showDetails)}
                className="w-full py-3 bg-[#7B61FF] text-white rounded-xl hover:bg-[#5B3FD1] transition-colors"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-map-marker-alt mr-2"></i>
                Navigate to Spot
              </motion.button>
              <motion.button
                onClick={closeDetails}
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

export default History;