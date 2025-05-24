import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper: create token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Register function
export async function registerUser(req, res) {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must have at least 8 characters.",
    });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // Create token
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registered successfully.",
      token, // you can send token here if frontend needs it
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  // Input check
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email or Password missing.",
    });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Create token
    const token = createToken(user._id);

    // Success response
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

//get current user function

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("get user api error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

export async function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name || !email || !validator.isEmail(email)) {
    res.status(400).json({
      success: false,
      message: "Invalid name or email.",
    });
  }
  try {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists) {
      res.status(409).json({
        success: false,
        message: "Email already in use by another account",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: "name email" }
    );
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

//change Password function
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password invalid or too short (min 8 characters)",
    });
  }

  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}
