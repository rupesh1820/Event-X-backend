import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    eventId: { type: String, required: true },
    eventName: { type: String, required: true },
    eventImage: { type: String, default: null },
    eventLocation: { type: String, default: null },
    eventDate: { type: String, default: null },
    eventTime: { type: String, default: null },
    fullName: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;