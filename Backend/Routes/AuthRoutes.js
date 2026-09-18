import express from "express";

import {
  bookingUp,
  updateProfile,
  login,
  register,
  verifyRegisterOtp,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from "../Controllers/AuthContro.js";

import { requireAuth } from "../Middleware/auth.js";

const authRouter = express.Router();


// ==========================
// REGISTER
// ==========================

authRouter.post(
  "/register",
  register
);

authRouter.post(
  "/verify-register-otp",
  verifyRegisterOtp
);


// ==========================
// LOGIN
// ==========================

authRouter.post(
  "/login",
  login
);


// ==========================
// FORGOT PASSWORD
// ==========================

authRouter.post(
  "/forgot-password",
  forgotPassword
);

authRouter.post(
  "/verify-reset-otp",
  verifyResetOtp
);

authRouter.post(
  "/reset-password",
  resetPassword
);


// ==========================
// BOOKING
// ==========================

authRouter.post(
  "/book",
  bookingUp
);


// ==========================
// PROFILE
// ==========================

authRouter.patch(
  "/profile/edit",
  requireAuth,
  updateProfile
);


export default authRouter;