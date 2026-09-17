import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import inquiryrouter from "./Routes/inquiry.js";
import { Rolerouter } from "./Routes/RoleRoutes.js";
import AdminRouter from "./Routes/AdminRoute.js";
import { connectDB } from "./Config/db.js";
import authRouter from "./Routes/AuthRoutes.js";
import eventRouter from "./Routes/EventRouter.js";
import { requireAuth } from "./Middleware/auth.js";
import {
  bookingUp,
  cancelBooking,
  getBookings,
} from "./Controllers/AuthContro.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://event-x-fw68.vercel.app",
  "https://event-x-bice.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman ya server-to-server request ke liye
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api", eventRouter);
app.use("/api", Rolerouter);

app.post("/api/book", requireAuth, bookingUp);
app.get("/api/book", getBookings);
app.patch("/api/book/:id", requireAuth, cancelBooking);

app.use("/api/admin", AdminRouter);
app.use("/api/inquiries", inquiryrouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(`Database startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();