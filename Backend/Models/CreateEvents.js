import mongoose from "mongoose";

const CreateEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    hostName: {
      type: String,
      required: true,
    },

    audience: {
      type: String,
      required: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    venueName: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    imageUrl: {
      type: String,
    },

    image: {
      type: String,
    },

    maxCapacity: {
      type: Number,
      required: true,
    },

    ticketType: {
      type: String,
      required: true,
    },

    earlyBirdPrice: {
      type: Number,
      required: true,
    },

    ticketPrice: {
      type: Number,
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: String,
    },

    refundPolicy: {
      type: String,
    },

    live: {
      type: Boolean,
      default: false,
    },

    // Event creator
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Admin approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Admin who approved/rejected
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const EventCreate =
  mongoose.models.EventCreate ||
  mongoose.model("CreateEvent", CreateEventSchema);

export default EventCreate;