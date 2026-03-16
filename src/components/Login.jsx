"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

const supabaseUrl = "https://gkivayayjpevqvrutkez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraXZheWF5anBldnF2cnV0a2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODIxNjIsImV4cCI6MjA1Njg1ODE2Mn0.ZaWDcAlZQY-u3svrxJ8UC5poDd4D_dtCWopsBzaD4hA";
const supabase = createClient(supabaseUrl, supabaseKey);

function Login({ setUser, setIsGuest, setActiveTab }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    numberplate: "",
    vehicleType: "car",
    wheels: 4,
    size: "medium",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setMessage(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("You forgot to write your email or password!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Your email looks funny! It needs an @ and a dot.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Your password is too short! Make it 6 letters or more.");
      return false;
    }
    if (!isLogin && !formData.numberplate) {
      setError("You need to tell us your car’s number for sign-up!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setError("Wrong key! Check your email or password.");
          throw error;
        }

        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (fetchError) {
          setError("Can’t find you in our toy box!");
          throw fetchError;
        }

        setUser(userData);
        setActiveTab("home");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              numberplate: formData.numberplate,
              username: formData.email.split("@")[0],
              vehicle_type: formData.vehicleType,
              wheels: parseInt(formData.wheels),
              size: formData.size,
            },
          },
        });

        if (error) {
          setError("Oops! That email might already have a key!");
          throw error;
        }

        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: formData.email,
          numberplate: formData.numberplate,
          username: formData.email.split("@")[0],
          vehicle_type: formData.vehicleType,
          wheels: parseInt(formData.wheels),
          size: formData.size,
        });

        if (insertError) {
          setError("Can’t add you to the toy box!");
          throw insertError;
        }

        setMessage("Check your email to finish making your key, then come back to sign in!");
        setFormData({
          email: "",
          password: "",
          numberplate: "",
          vehicleType: "car",
          wheels: 4,
          size: "medium",
        });
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Magic door error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Tell us a real email so we can send you a new key!");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
      if (error) {
        setError("Oops! Can’t send a new key right now!");
        throw error;
      }
      setMessage("A new key is on its way! Check your email!");
      setForgotPassword(false);
    } catch (error) {
      console.error("New key error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setIsGuest(true);
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticlesBackground />
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-center mb-8 space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#8B5CF6] p-2 rounded-xl shadow-md">
            <i className="fas fa-car text-xl text-white"></i>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ParkWise
          </h1>
        </motion.div>

        <motion.div
          className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg border border-[#2C2C2E]"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {forgotPassword ? "Get a New Key" : isLogin ? "Sign In" : "Make a Key"}
          </h2>

          {forgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                  placeholder="Your email"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8B5CF6] text-white rounded-2xl hover:bg-[#7B61FF] disabled:opacity-50 shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : "Send New Key"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setForgotPassword(false)}
                className="w-full text-[#8B5CF6] hover:text-[#7B61FF]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Back to Sign In
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                  placeholder="Your email"
                />
              </div>
              <div className="relative">
                <label className="block text-gray-400 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm pr-12"
                  placeholder="Your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B5CF6] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </motion.button>
              </div>
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="numberplate">
                      Car Number
                    </label>
                    <input
                      type="text"
                      id="numberplate"
                      name="numberplate"
                      value={formData.numberplate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white placeholder-gray-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                      placeholder="Like DL 01 AB 1234"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2" htmlFor="vehicleType">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                    >
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="suv">SUV</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="wheels">
                        Wheels
                      </label>
                      <select
                        id="wheels"
                        name="wheels"
                        value={formData.wheels}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                      >
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="6">6</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2" htmlFor="size">
                        Size
                      </label>
                      <select
                        id="size"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-[#2C2C2E] border border-[#3C3C3E] rounded-2xl text-white focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] shadow-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8B5CF6] text-white rounded-2xl hover:bg-[#7B61FF] disabled:opacity-50 shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : isLogin ? "Sign In" : "Sign Up"}
              </motion.button>
              <div className="text-center space-y-2">
                <motion.button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#8B5CF6] hover:text-[#7B61FF]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLogin ? "Need a key? Sign Up" : "Have a key? Sign In"}
                </motion.button>
                {isLogin && (
                  <motion.button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="block text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    Forgot your key?
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={handleGuestMode}
                  className="block text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  Sign In as a Guest
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;