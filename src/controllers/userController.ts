import { User } from "../models/userModel.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js";

const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, studentId, department } = req.body;
    if (!fullName || !email || !password || !studentId || !department) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingEmail = await User.findOne({
      email,
    });
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }
    const existingStudent = await User.findOne({
      studentId,
    });
    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: "Student ID already exists",
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      studentId,
      department,
    });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not created",
      });
    }
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    generateToken(res, user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getProfile = async (req: AuthRequest, res: Response) => {
    try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetURL}">
          Click here to reset your password
        </a>
      </p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Hash the token received from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token as string)
      .digest("hex");

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export {register, login, getProfile, logout, forgotPassword, resetPassword}