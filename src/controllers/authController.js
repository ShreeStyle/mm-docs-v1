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
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    console.log('🔍 Searching for user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User found:', { id: user._id, email: user.email, hasPassword: !!user.password });

    // Check if password exists
    if (!user.password) {
      console.error('❌ User has no password set:', email);
      return res.status(500).json({ message: "Account configuration error. Please contact support." });
    }

    // Check password
    console.log('🔐 Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: "Invalid credentials" });
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
    console.error("❌ Login error:", err);
    console.error("❌ Error stack:", err.stack);
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
