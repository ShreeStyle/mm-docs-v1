const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtUtils");
const { sendOTPEmail } = require("../services/email/emailService");

// Generate a secure 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Direct login with email and password
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body?.email, hasBody: !!req.body });
    
    const password = req.body?.password;
    const email = req.body?.email?.trim().toLowerCase();

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: "Database connection error. Please try again in a moment.",
        hint: "The server is starting up. Please wait a few seconds and try again."
      });
    }

    // Find user
    console.log('🔍 Searching for user:', email);
    const user = await User.findOne({ email }).maxTimeMS(5000); // 5 second timeout
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ 
        message: "User not found. Please check your email or sign up first.",
        hint: "If you're trying to use demo@test.com, this user may not exist in the production database."
      });
    }

    console.log('✅ User found:', { id: user._id, email: user.email, hasPassword: !!user.password });

    // Check if password exists
    if (!user.password) {
      console.error('❌ User has no password set:', email);
      return res.status(500).json({ 
        message: "Account configuration error. Please contact support.",
        hint: "This account was not set up correctly."
      });
    }

    // Check password
    console.log('🔐 Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: "Invalid credentials. Please check your password." });
    }

    // Generate JWT token
    console.log('🎫 Generating token...');
    const token = generateToken(user._id);
    console.log('✅ Token generated');

    console.log(`✅ Login successful for ${user.email}`);

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.error("❌ Error name:", err.name);
    console.error("❌ Error stack:", err.stack);
    
    // Provide specific error messages based on error type
    let message = "Login failed. Please try again.";
    let hint = null;
    
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
      message = "Database connection error. Please try again.";
      hint = "The server is connecting to the database. Please wait a moment.";
    } else if (err.message?.includes('timeout')) {
      message = "Request timeout. Please try again.";
      hint = "The server may be starting up. Try again in a few seconds.";
    }
    
    res.status(500).json({ 
      message, 
      error: err.message,
      hint
    });
  }
};

// Step 2: Verify OTP and complete login
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({ message: "No OTP found. Please login again." });
    }

    // Check if OTP has expired
    if (user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please login again." });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid - clear it and generate JWT token
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    console.log(`✅ OTP verified successfully for ${user.email}`);

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, countryCode } = req.body;

    // check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-detect timezone from country
    const timezoneMap = {
      IN: "Asia/Kolkata", US: "America/New_York", GB: "Europe/London",
      AE: "Asia/Dubai", SG: "Asia/Singapore", AU: "Australia/Sydney",
      CA: "America/Toronto", DE: "Europe/Berlin"
    };

    // create user with country-aware defaults
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      countryCode: countryCode || "IN",
      timezone: timezoneMap[countryCode] || "Asia/Kolkata",
      onboardingStep: 0,
      onboarded: false
    });

    // Generate token so user is logged in immediately after signup
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Signup successful ✅",
      userId: user._id,
      token,
      onboarded: false,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        countryCode: user.countryCode
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};
