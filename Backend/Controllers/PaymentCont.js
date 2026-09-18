import crypto from "crypto";
import razorpay from "../Config/razorpay.js";
import Booking from "../Models/Bookings.js"

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    return res.status(500).json({
      message: "Unable to create order",
      error: error.error?.description || error.message,
    });
  }
};


// Verify Payment + Create Booking
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      eventId,
      eventName,
      eventImage,
      eventLocation,
      eventDate,
      eventTime,

      fullName,
      number,
      emailAddress,

      quantity,
      total,
      paymentMethod,
    } = req.body;

    // Check required payment details
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details missing",
      });
    }

    // Generate signature using Razorpay secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // Check booking details
    if (
      !eventId ||
      !eventName ||
      !fullName ||
      !number ||
      !emailAddress ||
      !quantity ||
      total === undefined
    ) {
      return res.status(400).json({
        message: "Booking details missing",
      });
    }

    // Create booking
    const booking = new Booking({
      userId: req.user?.userId || null,

      eventId,
      eventName,
      eventImage: eventImage || null,
      eventLocation: eventLocation || null,
      eventDate: eventDate || null,
      eventTime: eventTime || null,

      fullName,
      number,
      emailAddress,

      quantity: Number(quantity),
      total: Number(total),

      paymentMethod: paymentMethod || "razorpay",

      status: "confirmed",
    });

    await booking.save();

    return res.status(201).json({
      message: "Payment verified and booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};