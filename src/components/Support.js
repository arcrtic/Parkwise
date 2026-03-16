import React, { useState } from "react";
import { motion } from "framer-motion";

function Support() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I book a parking spot?",
      answer: "Just go to Explore, pick a spot, and follow the steps—easy peasy!",
    },
    {
      question: "Can I get my money back?",
      answer: "Yup! Cancel your booking and get 90% back in your wallet.",
    },
    {
      question: "What if I’m lost?",
      answer: "Use the “Navigate” button—it’s like a treasure map to your spot!",
    },
    {
      question: "How do I contact support?",
      answer: "Use the chat or call buttons above, or email us at support@parkwise.com",
    },
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = () => {
    // Implement live chat functionality here
    window.open("https://your-chat-service.com", "_blank");
  };

  const handleCallClick = () => {
    // Open phone dialer
    window.location.href = "tel:+1-800-555-1234";
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:support@parkwise.com";
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6 p-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
        Support Center
      </h2>

      <motion.div
        className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-semibold text-xl text-white mb-4">
          Need Help? We’re Here!
        </h3>
        <p className="text-gray-400 mb-4">
          Ask us anything, anytime! We’re like your parking superheroes.
          <br />
          <span className="text-sm">Available 24/7</span>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.button
            onClick={handleChatClick}
            className="bg-[#7B61FF] text-white px-6 py-3 rounded-xl hover:bg-[#5B3FD1] transition-colors"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-comment mr-2"></i>
            Live Chat
          </motion.button>
          <motion.button
            onClick={handleCallClick}
            className="bg-[#FFD60A] text-black px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-phone mr-2"></i>
            Call Us
          </motion.button>
          <motion.button
            onClick={handleEmailClick}
            className="bg-[#2C2C2E] border border-[#7B61FF] text-white px-6 py-3 rounded-xl hover:bg-[#3C3C3E] transition-colors"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-envelope mr-2"></i>
            Email Us
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-semibold text-xl text-white mb-4">
          Quick Answers
        </h3>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-[#1C1C1E] border border-[#3C3C3E] rounded-xl text-white placeholder-gray-500 focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition-all"
          />
        </div>
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <p className="text-gray-400">No matching FAQs found.</p>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full text-left flex justify-between items-center py-2"
                >
                  <p className="text-gray-300 font-medium">{faq.question}</p>
                  <i className={`fas fa-chevron-${expandedFAQ === index ? "up" : "down"} text-gray-400`}></i>
                </button>
                {expandedFAQ === index && (
                  <motion.p
                    className="text-gray-400 text-sm mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-semibold text-xl text-white mb-4">
          Contact Information
        </h3>
        <div className="space-y-2 text-gray-400">
          <p><i className="fas fa-phone mr-2"></i> +1-800-555-1234</p>
          <p><i className="fas fa-envelope mr-2"></i> support@parkwise.com</p>
          <p><i className="fas fa-map-marker-alt mr-2"></i> 123 Parking Lane, Car City</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Support;