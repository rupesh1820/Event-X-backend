import "dotenv/config";

import express from "express";
import cors from "cors";

import inquiryrouter from "./Routes/inquiry.js";
import { Rolerouter } from "./Routes/RoleRoutes.js";
import AdminRouter from "./Routes/AdminRoute.js";
import PaymentRouter from "./Routes/Paymentroute.js";
import { connectDB } from "./Config/db.js";
import authRouter from "./Routes/AuthRoutes.js";
import eventRouter from "./Routes/EventRouter.js";

import { requireAuth } from "./Middleware/auth.js";
import {
  bookingUp,
  cancelBooking,
  getBookings,
} from "./Controllers/AuthContro.js";

const app = express();

const port = process.env.PORT || 5000;

// ===============================
// CORS
// ===============================

const allowedOrigins = [
    "https://event-x-official.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests like Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

// ===============================
// BODY PARSER
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROUTES
// ===============================

// Authentication
app.use("/api/auth", authRouter);

// Events
app.use("/api", eventRouter);

// Roles
app.use("/api", Rolerouter);

// ===============================
// BOOKINGS
// ===============================

// Create booking
app.post(
  "/api/book",
  requireAuth,
  bookingUp
);

// Get bookings
app.get(
  "/api/book",
  getBookings
);

// Cancel booking
app.patch(
  "/api/book/:id",
  requireAuth,
  cancelBooking
);

// ===============================
// PAYMENT
// ===============================

app.use(
  "/api/payment",
  PaymentRouter
);

// ===============================
// ADMIN
// ===============================

app.use(
  "/api/admin",
  AdminRouter
);

// ===============================
// INQUIRIES
// ===============================

app.use(
  "/api/inquiries",
  inquiryrouter
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.status(200).send("EventX Server is running");
});

// ===============================
// START SERVER
// ===============================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      port,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port http://localhost:${port}`
        );

        console.log(
          "JWT_SECRET loaded:",
          !!process.env.JWT_SECRET
        );
      }
    );
  } catch (error) {
    console.error(
      `Database startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();