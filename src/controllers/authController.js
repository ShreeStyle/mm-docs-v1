const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtUtils");
const { sendOTPEmail } = require("../services/email/emailService");

// Generate a secure 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Login with email and password (sends OTP)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Set OTP expiration (10 minutes)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, user.name, otp);
      console.log(`✅ OTP email sent to ${user.email}`);
    } catch (emailError) {
      console.error("⚠️  Email sending failed:", emailError.message);
      
      // In development, continue even if email fails (for testing)
      if (process.env.NODE_ENV !== 'development') {
        return res.status(500).json({ 
          message: "Failed to send OTP. Please check email configuration." 
        });
      }
      console.log('📧 Development mode: Continuing without email...');
    }

    console.log(`🔐 OTP generated for ${user.email}: ${otp}`); // For development/testing
    
    res.status(200).json({
      message: "OTP sent to your email",
      requiresOTP: true,
      email: user.email,
      // In development, you might want to include OTP for testing
      // Remove this in production!
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
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
    const { name, email, password } = req.body;

    // check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful ✅",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};
