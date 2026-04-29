"use client";
import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";
import Home from "../components/Home";
import Wallet from "../components/Wallet";
import Slots from "../components/Slots";
import Payment from "../components/Payment";
import History from "../components/History";
import BookingForm from "../components/BookingForm";
import Login from "../components/Login";
import Support from "../components/Support";
import { supabase } from "../lib/supabaseClient";

function MainComponent() {
  const [activeTab, setActiveTab] = useState("login");
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(500);
  const [parkCard, setParkCard] = useState({ balance: 0, discount: 0 });
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [reservationStatus, setReservationStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [mockHistoryData, setMockHistoryData] = useState({
    ongoing: [],
    completed: [],
    cancelled: [],
  });
  const [mockParkingLots, setMockParkingLots] = useState([
    {
      id: 1,
      name: "Viviana Mall",
      available: 4,
      total: 4,
      airQuality: "Good",
      price: "150",
      coordinates: { lat: 19.2087, lng: 72.9716 },
    },
    {
      id: 2,
      name: "Korum Mall",
      available: 4,
      total: 4,
      airQuality: "Moderate",
      price: "120",
      coordinates: { lat: 19.2035, lng: 72.9652 },
    },
    {
      id: 3,
      name: "R Mall",
      available: 4,
      total: 4,
      airQuality: "Good",
      price: "100",
      coordinates: { lat: 19.2215, lng: 72.9785 },
    },
    {
      id: 4,
      name: "Lake City Mall",
      available: 4,
      total: 4,
      airQuality: "Good",
      price: "130",
      coordinates: { lat: 19.1887, lng: 72.9635 },
    },
  ]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error.message);
        setActiveTab("login");
        return;
      }

      if (session && !user) {
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select()
          .eq("id", session.user.id)
          .single();

        if (fetchError || !userData) {
          const meta = session.user.user_metadata;
          if (!meta.numberplate || !meta.username) {
            console.error("Incomplete metadata:", meta);
            setActiveTab("login");
            return;
          }

          const { error: upsertError } = await supabase.from("users").upsert({
            id: session.user.id,
            email: session.user.email,
            numberplate: meta.numberplate,
            username: meta.username,
            phone: meta.phone || "",
            vehicle_type: meta.vehicle_type || "car",
            wheels: parseInt(meta.wheels) || 4,
            size: meta.size || "medium",
          });

          if (upsertError) {
            console.error("Upsert error:", upsertError.message);
            setActiveTab("login");
            return;
          }

          const { data: newUserData, error: newFetchError } = await supabase
            .from("users")
            .select()
            .eq("id", session.user.id)
            .single();
          if (newFetchError) {
            console.error("Fetch after upsert error:", newFetchError.message);
            setActiveTab("login");
            return;
          }

          setUser(newUserData);
        } else {
          setUser(userData);
        }
        setIsGuest(false);
        setActiveTab("home");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkSession();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsGuest(false);
        setActiveTab("login");
        setShowUserMenu(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError(null);
        },
        (error) => {
          setLocationError("Please enable location access to find nearby parking spots");
        }
      );
    } else {
      setLocationError("Geolocation not supported in your browser");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBookingConfirmed = (data) => {
    setBookingData(data);
    setActiveTab("payment");
  };

  const updateParkingLotAvailability = (parkingLotId) => {
    setMockParkingLots((prev) =>
      prev.map((lot) =>
        lot.id === parkingLotId && lot.available > 0 ? { ...lot, available: lot.available - 1 } : lot
      )
    );
  };

  const resetBookingStatus = () => {
    setReservationStatus(null);
    setPaymentStatus(null);
    setSelectedSlot(null);
    setBookingData(null);
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else if (isGuest) {
      setIsGuest(false);
      setUser(null);
      setActiveTab("login");
    }
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    if (activeTab !== "login") setActiveTab("home");
    setShowUserMenu(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowUserMenu(false);
  };

  if (activeTab === "login" && !user && !isGuest) {
    return <Login setUser={setUser} setIsGuest={setIsGuest} setActiveTab={setActiveTab} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] text-white font-poppins relative overflow-hidden">
      <ParticlesBackground />
      <div className="bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#7000FF] p-3 rounded-xl">
              <i className="fas fa-car text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ParkWise
            </h1>
          </motion.div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={menuRef}>
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-10 h-10 bg-[#1A1A1A] rounded-full hover:bg-[#2D2D2D] transition-colors"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-user text-[#7000FF] text-lg"></i>
              </motion.button>
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 mt-2 bg-[#1A1A1A] rounded-lg shadow-xl p-2 w-48 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-gray-400 px-4 py-2">
                    Hi, {user ? user.email : isGuest ? "Guest" : "Nobody yet!"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-[#2D2D2D] hover:text-white rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={() => handleTabClick("support")}
              className="hidden md:flex items-center space-x-2 bg-[#1A1A1A] hover:bg-[#2D2D2D] px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <i className="fas fa-headset text-[#7000FF]"></i>
              <span>Support</span>
            </motion.button>
            <div className="relative">
              <motion.button
                className="bg-[#1A1A1A] p-2 rounded-lg hover:bg-[#2D2D2D] transition-colors"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-bell text-[#7000FF]"></i>
              </motion.button>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7000FF] rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex flex-wrap gap-3 mb-6 bg-[#1A1A1A] p-3 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => handleTabClick("home")}
            className={`flex-1 px-4 py-3 rounded-xl font-medium ${
              activeTab === "home"
                ? "bg-[#7000FF] text-white"
                : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3D3D3D]"
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-compass mr-2"></i>Explore
          </motion.button>
          <motion.button
            onClick={() => handleTabClick("wallet")}
            className={`flex-1 px-4 py-3 rounded-xl font-medium ${
              activeTab === "wallet"
                ? "bg-[#7000FF] text-white"
                : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3D3D3D]"
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-wallet mr-2"></i>Wallet
          </motion.button>
          <motion.button
            onClick={() => handleTabClick("history")}
            className={`flex-1 px-4 py-3 rounded-xl font-medium ${
              activeTab === "history"
                ? "bg-[#7B61FF] text-white"
                : "bg-[#2A2A2A] text-gray-400 hover:bg-[#3D3D3D]"
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <i className="fas fa-clock mr-2"></i>Activity
          </motion.button>
        </motion.div>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === "home" && (
            <Home
              userLocation={userLocation}
              locationError={locationError}
              mockParkingLots={mockParkingLots}
              setSelectedParkingLot={setSelectedParkingLot}
              setActiveTab={setActiveTab}
              resetBookingStatus={resetBookingStatus}
            />
          )}
          {activeTab === "wallet" && (
            <Wallet
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance}
              mockHistoryData={mockHistoryData}
              setMockHistoryData={setMockHistoryData}
              parkCard={parkCard}
              setParkCard={setParkCard}
            />
          )}
          {activeTab === "slots" && selectedParkingLot && (
            <Slots
              selectedParkingLot={selectedParkingLot}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              reservationStatus={reservationStatus}
              mockHistoryData={mockHistoryData}
              paymentStatus={paymentStatus}
              selectedDuration={selectedDuration}
              setActiveTab={setActiveTab}
              user={user}
              isGuest={isGuest}
              setBookingData={setBookingData}
              mockParkingLots={mockParkingLots}
              setMockParkingLots={setMockParkingLots}
            />
          )}
          {activeTab === "booking" && isGuest && selectedParkingLot && (
            <BookingForm
              selectedParkingLot={selectedParkingLot}
              selectedSlot={selectedSlot}
              setActiveTab={setActiveTab}
              onBookingConfirmed={handleBookingConfirmed}
            />
          )}
          {activeTab === "payment" && selectedParkingLot && (
            <Payment
              selectedParkingLot={selectedParkingLot}
              selectedSlot={selectedSlot}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              reservationStatus={reservationStatus}
              setReservationStatus={setReservationStatus}
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              setMockHistoryData={setMockHistoryData}
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance}
              mockHistoryData={mockHistoryData}
              setActiveTab={setActiveTab}
              bookingData={bookingData}
              updateParkingLotAvailability={updateParkingLotAvailability}
              user={user}
              passDiscount={parkCard.discount}
            />
          )}
          {activeTab === "history" && (
            <History
              mockHistoryData={mockHistoryData}
              setMockHistoryData={setMockHistoryData}
              setWalletBalance={setWalletBalance}
              setMockParkingLots={setMockParkingLots}
              resetBookingStatus={resetBookingStatus}
            />
          )}
          {activeTab === "support" && <Support />}
        </motion.div>
      </div>
    </div>
  );
}

export default MainComponent;