"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Wallet({ walletBalance, setWalletBalance, mockHistoryData, setMockHistoryData }) {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  useEffect(() => {
    console.log("Wallet: Current mockHistoryData:", mockHistoryData);
    console.log("Wallet: setMockHistoryData is function:", typeof setMockHistoryData === "function");
  }, [mockHistoryData, setMockHistoryData]);

  const handleAddMoney = () => {
    setShowAddMoneyModal(true);
    setErrorMessage(null);
    setAddAmount("");
  };

  const validateAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000;
  };

  const handleAddMoneyPayment = async () => {
    if (!validateAmount(addAmount)) {
      setErrorMessage("Please enter a valid amount between 1 and 10,000!");
      return;
    }

    setPaymentProcessing(true);
    setErrorMessage(null);

    const amount = parseFloat(addAmount);
    const transaction = {
      id: Date.now(),
      type: "Add Money",
      amount: amount,
      method: selectedPaymentMethod,
      time: new Date().toLocaleString(),
      qrCode: `WALLET-ADD-${Date.now()}`,
      status: "Completed",
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setWalletBalance((prev) => {
        const newBalance = prev + amount;
        console.log("Wallet: New balance after adding:", newBalance);
        return newBalance;
      });

      if (typeof setMockHistoryData === "function") {
        setMockHistoryData((prev) => {
          const newCompleted = [...prev.completed, transaction];
          const updatedData = { ...prev, completed: newCompleted };
          console.log("Wallet: Updated mockHistoryData after adding money:", updatedData);
          return updatedData;
        });
      } else {
        console.warn("Wallet: setMockHistoryData is not a function, using local update only");
      }

      setCurrentTransaction(transaction);
      setShowReceiptModal(true);
      setShowAddMoneyModal(false);
    } catch (error) {
      console.error("Wallet: Error during payment:", error);
      setErrorMessage("Payment failed due to an unexpected error. Please try again!");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const downloadReceipt = () => {
    if (!currentTransaction) return;

    const receiptContent = `
      ParkWise Wallet Receipt
      ----------------------
      Transaction ID: ${currentTransaction.id}
      Type: ${currentTransaction.type || "Parking Booking"}
      Amount: ₹${(currentTransaction.amount || 0).toFixed(2)}
      Time: ${currentTransaction.time}
      Status: ${currentTransaction.status}
      ${currentTransaction.parking_lot_name ? `Location: ${currentTransaction.parking_lot_name}` : ""}
      ${currentTransaction.slotNumber ? `Slot: ${currentTransaction.slotNumber}` : ""}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-receipt-${currentTransaction.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const allTransactions = mockHistoryData
    ? [...mockHistoryData.ongoing, ...mockHistoryData.completed, ...mockHistoryData.cancelled]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
    : [];

  return (
    <motion.div
      className="bg-black p-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-gradient-to-r from-[#2C2C2E] to-[#1C1C1E] rounded-2xl p-6 mb-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold mb-2 text-white">Wallet Balance</h2>
            <motion.p
              className="text-[#FFD60A] text-4xl font-bold mb-4"
              key={walletBalance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ₹{walletBalance.toFixed(2)}
            </motion.p>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={handleAddMoney}
              className="bg-gradient-to-r from-[#7B61FF] to-[#5B3FD1] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Add Money
            </motion.button>
          </div>
        </div>
      </motion.div>

      {mockHistoryData && (
        <motion.div
          className="bg-[#2C2C2E] rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4 text-white">Recent Transactions</h3>
          {allTransactions.length > 0 ? (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {allTransactions.map((txn) => (
                <motion.div
                  key={txn.id}
                  className="flex justify-between items-center border-b border-[#3C3C3E] pb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <p className="text-gray-300">
                      {txn.type === "Add Money" ? "Add Money" : 
                       txn.type === "Refund" ? "Refund" : 
                       "Parking Booking"}
                    </p>
                    <p className="text-sm text-gray-400">{txn.time}</p>
                    {txn.parking_lot_name && <p className="text-xs text-gray-500">{txn.parking_lot_name}</p>}
                  </div>
                  <p className={
                    txn.type === "Add Money" || txn.type === "Refund" ? "text-green-400" : "text-red-400"
                  }>
                    {(txn.type === "Add Money" || txn.type === "Refund") ? "+" : "-"}₹{(txn.amount || 0).toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No transactions yet ORGANICALLY.</p>
          )}
        </motion.div>
      )}

      {showAddMoneyModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-[#2C2C2E] p-6 rounded-2xl w-full max-w-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add Money to Wallet</h3>
              <motion.button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-times text-xl"></i>
              </motion.button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount (1-10,000)"
                  className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#FFD60A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white focus:border-[#FFD60A]"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              {selectedPaymentMethod === "upi" && (
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-4 text-white">Scan to Pay</h4>
                  <motion.div
                    className="bg-white p-8 rounded-xl mb-4 mx-auto max-w-[240px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <i className="fas fa-qrcode text-8xl text-black"></i>
                  </motion.div>
                  <p className="text-lg font-medium mb-2 text-white">Amount: ₹{addAmount || "0"}</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <motion.p
                className="text-red-500 text-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errorMessage}
              </motion.p>
            )}

            <motion.button
              onClick={handleAddMoneyPayment}
              className="w-full py-4 bg-gradient-to-r from-[#FFD60A] to-[#FF9900] text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
              disabled={paymentProcessing}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {paymentProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Processing
                </>
              ) : (
                `Pay ₹${addAmount || "0"}`
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {showReceiptModal && currentTransaction && (
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
                All Done!
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-xl mb-6 mx-auto max-w-[200px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentTransaction.qrCode}`}
                  alt="Wallet QR Code"
                  className="w-full"
                />
              </motion.div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID</span>
                <span>{currentTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {currentTransaction.type === "Add Money" ? "Amount Added" : "Amount"}
                </span>
                <span className={currentTransaction.type === "Add Money" ? "text-[#FFD60A]" : "text-red-400"}>
                  {currentTransaction.type === "Add Money" ? "+" : "-"}₹{(currentTransaction.amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span>{currentTransaction.time}</span>
              </div>
              {currentTransaction.parking_lot_name && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span>{currentTransaction.parking_lot_name}</span>
                </div>
              )}
              {currentTransaction.slotNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Slot</span>
                  <span>{currentTransaction.slotNumber}</span>
                </div>
              )}
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
                onClick={() => setShowReceiptModal(false)}
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
    </motion.div>
  );
}

export default Wallet;