import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose from "mongoose";
import User from "../Models/Users.js";
import Booking from "../Models/Bookings.js";
import EventCreate from "../Models/CreateEvents.js";
import Otp from "../Models/OTP.js";
import {sendOtpEmail} from "../Config/mailer.js"



const JWT_SECRET = process.env.JWT_SECRET || "eventx-development-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin1820";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1820";
const ADMIN_IDD = process.env.ADMIN_ID || "68a123456789012345678901"
const Register = async (req, res) => {
  try {
    const {
      fullName,
      emailAddress,
      password,
      confirmPassword,
      role,
    } = req.body;

    const email = emailAddress?.trim().toLowerCase();

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Email is not valid",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password not matched",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existUser = await User.findOne({
      emailAddress: email,
    });

    if (existUser) {
      return res.status(409).json({
        message: "This email is already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      userData: {
        fullName: fullName.trim(),
        emailAddress: email,
        password: hashedPassword,
        role: role === "creator" ? "creator" : "user",
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log("OTP generated:", otp);
    console.log("Sending OTP to:", email);

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Register OTP error:", error);

    return res.status(500).json({
      message: "Unable to send OTP",
      error: error.message,
    });
  }
};

export const register = Register;

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;

    const email = emailAddress?.trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found. Please request OTP again",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP expired. Please register again",
      });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const existingUser = await User.findOne({
      emailAddress: email,
    });

    if (existingUser) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    const user = await User.create(otpRecord.userData);

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: "Unable to verify OTP",
    });
  }
};

const AdminId = new mongoose.Types.ObjectId();
export const login = async (req, res) => {
  try {
    const emailAddress = req.body.emailAddress?.trim().toLowerCase();
    const { password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Admin login
    if (
      emailAddress === ADMIN_USERNAME.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          userId: AdminId,
          emailAddress: ADMIN_USERNAME,
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          id: AdminId,
          fullName: "EventX Administrator",
          emailAddress: ADMIN_USERNAME,
          role: "admin",
        },
      });
    }

    // Normal user login
    const user = await User.findOne({ emailAddress });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const role = user.role || "user";

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        emailAddress: user.emailAddress,
        role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};




export const bookingUp = async (req, res) => {
  try {
    const {
      userId: bodyUserId,
      number: bodyNumber,
      attendeePhone,
      emailAddress: bodyEmailAddress,
      attendeeEmail,
      fullName: bodyFullName,
      attendeeName,
      eventId,
      eventName,
      eventImage,
      eventLocation,
      eventDate,
      eventTime,
      quantity,
      total,
      paymentMethod,
    } = req.body;
    const number = bodyNumber || attendeePhone;
    const emailAddress = bodyEmailAddress || attendeeEmail;
    const fullName = bodyFullName || attendeeName;

    if (!number || !emailAddress || !fullName || !eventId || !quantity) {
      return res.status(400).json({ message: "Booking details are required" });
    }

    const userId = req.user?.userId || bodyUserId || null;

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: { number, fullName, emailAddress },
      });
    }

    const booking = new Booking({
      userId,
      fullName,
      number,
      emailAddress,
      eventId,
      eventName,
      eventImage,
      eventLocation,
      eventDate,
      eventTime,
      quantity,
      total,
      paymentMethod,
      status: "confirmed",
    });

    await booking.save();
    res.status(201).json({ message: "Booking Successful", booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Error in booking" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const event = mongoose.isValidObjectId(booking.eventId)
          ? await EventCreate.findById(booking.eventId)
              .select("image imageUrl venueName city date time")
              .lean()
          : null;

        return {
          ...booking.toObject(),
          id: booking._id,
          eventImage: booking.eventImage || event?.image || event?.imageUrl,
          eventLocation:
            booking.eventLocation ||
            [event?.venueName, event?.city].filter(Boolean).join(", "),
          eventDate: booking.eventDate || event?.date,
          eventTime: booking.eventTime || event?.time,
        };
      }),
    );

    return res.status(200).json({ bookings: enrichedBookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({ message: "Unable to get bookings" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { status: "cancelled" } },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({
      message: "Booking cancelled",
      booking: { ...booking.toObject(), id: booking._id },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Unable to cancel booking" });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const {
      fullName,
      username,
      number,
      bio,
      language,
      timezone,
    } = req.body;

    const updateData = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }

    if (username !== undefined) {
      updateData.username = username.trim();
    }

    if (number !== undefined) {
      updateData.number = number;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (language !== undefined) {
      updateData.language = language;
    }

    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        id: updatedUser._id,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid ${error.path}`,
      });
    }

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};

