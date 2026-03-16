"use client";
import React, { useState, useEffect } from "react";
import Paho from "paho-mqtt";
import { motion } from "framer-motion";

function Slots({
  selectedParkingLot,
  selectedSlot,
  setSelectedSlot,
  reservationStatus,
  mockHistoryData,
  paymentStatus,
  selectedDuration,
  setActiveTab,
  user,
  isGuest,
  setBookingData,
  mockParkingLots,
  setMockParkingLots,
}) {
  const [slotStatuses, setSlotStatuses] = useState({
    0: "vacant",
    1: "vacant",
    2: "vacant",
    3: "vacant",
  });

  useEffect(() => {
    if (selectedParkingLot.name !== "Viviana Mall") return;

    const clientID = "clientID-" + Math.floor(Math.random() * 100);
    let client;

    function startConnect() {
      const host = "test.mosquitto.org";
      const port = 8080;

      console.log("Connecting to " + host + " on port " + port);
      console.log("Using the client ID " + clientID);

      client = new Paho.Client(host, Number(port), clientID);

      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;

      client.connect({
        onSuccess: onConnect,
        useSSL: false,
      });
    }

    function onConnect() {
      const topics = ["rj1", "rj2", "rj3", "rj4"];
      console.log("Subscribing to topics: " + topics.join(", "));
      client.subscribe(topics, (err) => {
        if (err) {
          console.error("Oops! Can’t listen: " + err);
        }
      });
    }

    function onConnectionLost(responseObject) {
      console.log("Oh no! Mailbox closed!");
      if (responseObject.errorCode !== 0) {
        console.log("Error: " + responseObject.errorMessage);
      }
    }

    function onMessageArrived(message) {
      const status = message.payloadString;
      const topic = message.destinationName;
      console.log("Got message: " + status + " from " + topic);

      const topicToSlot = {
        rj1: 0,
        rj2: 1,
        rj3: 2,
        rj4: 3,
      };

      const slotIndex = topicToSlot[topic];
      if (slotIndex !== undefined) {
        setSlotStatuses((prev) => ({
          ...prev,
          [slotIndex]: status === "FULL" ? "occupied" : "vacant",
        }));
      }
    }

    startConnect();

    return () => {
      if (client && client.isConnected()) {
        client.disconnect();
        console.log("Mailbox turned off!");
      }
    };
  }, [selectedParkingLot]);

  useEffect(() => {
    console.log("Toy garages now: ", slotStatuses);
  }, [slotStatuses]);

  const hasOngoingBooking = mockHistoryData.ongoing.length > 0;
  const isCurrentBooking = mockHistoryData.ongoing.some(
    (booking) =>
      booking.parking_lot_id === selectedParkingLot.id &&
      booking.slotNumber === (selectedSlot !== null ? `A${selectedSlot + 1}` : null)
  );

  const handleContinue = () => {
    if (selectedSlot !== null) {
      console.log("Picked garage A" + (selectedSlot + 1));
      if (user) {
        setBookingData({
          vehicleNumber: user.numberplate,
          userName: user.username,
          email: user.email,
          contactNumber: user.phone,
        });
        setActiveTab("payment");
      } else if (isGuest) {
        setActiveTab("booking");
      }
    } else {
      console.log("No garage picked yet!");
      alert("Pick a garage first!");
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your Parking Slot</h2>
        {!reservationStatus && (
          <>
            <motion.button
              onClick={handleContinue}
              className={`bg-[#7B61FF] text-white px-4 py-2 rounded-xl ${
                selectedSlot === null || hasOngoingBooking ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={selectedSlot === null || hasOngoingBooking}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Continue
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("home")}
              className="text-[#7B61FF] hover:text-[#5B3FD1] transition-colors"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Search
            </motion.button>
          </>
        )}
      </div>

      <motion.div
        className="bg-[#2C2C2E] rounded-lg p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">{selectedParkingLot.name}</h3>
          {reservationStatus === "confirmed" && isCurrentBooking && (
            <motion.div
              className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg inline-block mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fas fa-check-circle mr-2"></i>
              Booking Confirmed
            </motion.div>
          )}
          {hasOngoingBooking && !isCurrentBooking && (
            <motion.div
              className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg inline-block mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You already have an active booking! Cancel it to book another slot.
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
          {Array.from({ length: 4 }).map((_, index) => {
            const isOccupied = slotStatuses[index] === "occupied";
            const isSelected = selectedSlot === index;
            const isBooked = mockHistoryData.ongoing.some(
              (booking) =>
                booking.slotNumber === `A${index + 1}` &&
                booking.parking_lot_id === selectedParkingLot.id
            );

            return (
              <motion.button
                key={index}
                onClick={() => {
                  if (!isOccupied && !isBooked && !reservationStatus && !hasOngoingBooking) {
                    console.log("Picking garage A" + (index + 1));
                    setSelectedSlot(index);
                  }
                }}
                disabled={isOccupied || isBooked || reservationStatus || hasOngoingBooking}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  ${
                    isOccupied || isBooked
                      ? "bg-red-900/50 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#7B61FF] text-white ring-2 ring-[#7B61FF] ring-offset-2 ring-offset-[#2C2C2E]"
                      : "bg-green-900/50 hover:bg-[#7B61FF]/50"
                  }
                `}
                whileHover={{ scale: isOccupied || isBooked ? 1 : 1.05 }}
                transition={{ duration: 0.3 }}
              >
                A{index + 1}
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center gap-6">
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="w-4 h-4 bg-green-900/50 rounded"></div>
            <span className="text-sm text-gray-400">Available</span>
          </motion.div>
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <div className="w-4 h-4 bg-[#7B61FF] rounded"></div>
            <span className="text-sm text-gray-400">Selected</span>
          </motion.div>
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div className="w-4 h-4 bg-red-900/50 rounded"></div>
            <span className="text-sm text-gray-400">Occupied</span>
          </motion.div>
        </div>

        {reservationStatus === "confirmed" && isCurrentBooking && (
          <motion.div
            className="mt-6 p-4 bg-[#1C1C1E] rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Slot Number</p>
                <p className="font-semibold">A{selectedSlot + 1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{selectedDuration} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Payment Status</p>
                <p className="font-semibold text-yellow-400">
                  {paymentStatus === "full" ? "Paid" : "Partial Payment"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Amount</p>
                <p className="font-semibold text-[#FFD60A]">
                  ₹{selectedParkingLot.price * selectedDuration}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Slots;