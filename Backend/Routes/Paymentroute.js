import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../Controllers/PaymentCont.js";

import { requireAuth } from "../Middleware/auth.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", createOrder);

paymentRouter.post(
  "/verify",
  requireAuth,
  verifyPayment
);

export default paymentRouter;