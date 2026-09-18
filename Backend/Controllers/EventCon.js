
import Booking from "../Models/Bookings.js";
import EventCreate from "../Models/CreateEvents.js";
import mongoose from "mongoose";


export const eventCreate = async (req, res) => {
  try {
    const {
      title,
      category,
      shortDescription,
      hostName,
      audience,
      eventType,
      venueName,
      city,
      address,
      date,
      time,
      duration,
      imageUrl,
      maxCapacity,
      ticketType,
      ticketPrice,
      earlyBirdPrice,
      featured,
      tags,
      refundPolicy,
      live,
    } = req.body;

    const userRole = req.user?.role;
    const userId = req.user?.userId;
         
    if(!userId){
      return res.status(401).json({
        error: "User Id not found. please login again "
      });
    }
    console.log("Authenticated user:", {
      userId,
      role: userRole,
    });

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: "Valid user ID not found. Please login again.",
      });
    }

    const uploadedImage =
      req.file?.path || req.file?.secure_url || null;

    const providedImageUrl =
      typeof imageUrl === "string" ? imageUrl.trim() : "";

    const image = uploadedImage || providedImageUrl || null;

    if (!image) {
      return res.status(400).json({
        error: "Please upload an image or provide an image URL.",
      });
    }

    const approvalStatus =
      userRole === "creator" ? "pending" : "approved";

    const approvedBy =
      userRole === "admin" ? userId : null;

    const event = new EventCreate({
      title,
      category,
      shortDescription,
      hostName,
      audience,
      eventType,
      venueName,
      city,
      address,
      date,
      time,
      duration,

      imageUrl: image,
      image,

      maxCapacity,
      ticketType,
      ticketPrice,
      earlyBirdPrice,
      featured,
      tags,
      refundPolicy,
      live,

      creatorId: userId,
      approvalStatus,
      approvedBy,
    });

    await event.save();

    return res.status(201).json({
      message:
        approvalStatus === "pending"
          ? "Event submitted for admin approval"
          : "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Event creation failed:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

export const GetallEvent = async (req, res) => {
  try {
    const events = await EventCreate.find({
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } }
      ]
    });

    return res.status(200).json({
      message: "events founded",
      events
    });

  } catch (error) {
    console.error("GetallEvent Error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

export const GetEventById= async(req, res)=>{
  try {
    const event= await EventCreate.findById(req.params.id)
    if(!event){
      return res.status(501).json({message: "events not found"})
    }
    return res.status(201).json({message:" event get successfully", event})
  } catch (error) {
    return res.status(401).json({message: "events not found", error})
  }
}


// Admin ke liye pending events
export const getPendingEvents = async (req, res) => {
  try {
    const events = await EventCreate.find({
      approvalStatus: "pending",
    })
      .populate("creatorId", "fullName emailAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Pending events fetched successfully",
      events,
    });
  } catch (error) {
    console.error("Get pending events error:", error);

    return res.status(500).json({
      message: "Failed to fetch pending events",
    });
  }
};

// Admin event approve karega
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventCreate.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.approvalStatus === "approved") {
      return res.status(400).json({
        message: "Event is already approved",
      });
    }

    event.approvalStatus = "approved";
    event.approvedBy = req.user.userId;

    await event.save();

    return res.status(200).json({
      message: "Event approved successfully",
      event,
    });
  } catch (error) {
    console.error("Approve event error:", error);

    return res.status(500).json({
      message: "Failed to approve event",
    });
  }
};


//  Event by DI sab user ka personal

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID missing from token",
      });
    }

    const events = await EventCreate.find({
      creatorId: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("get my events error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyBookings = async (req, res)=>{
  try {
    
  const userId = req.user?.userId;
  if(!userId){
    return res.status(401).json({
      success: false,
      message: "User Id missing from token",
    });
  }
  const bookings = await Booking.find({userId: String(userId)}).sort({createdAt: -1});
  res.status(200).json({
    success: true,
    bookings
  });

  } catch (error) {
    console.error("Gte my bookings erroe : ", error)

    res.status(500).json({success:false, message: " Failed to fetch bookings"});
  }
};

export const cancelMyBooking = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: String(userId),
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Ticket cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Ticket cancel nahi ho payi",
    });
  }
};


export const getCreatorBookings = async (req, res) => {
  try {
    const creatorId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "User id not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const events = await EventCreate.find({
      creatorId: new mongoose.Types.ObjectId(creatorId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const eventIds = events.map((event) => String(event._id));

    const bookings = await Booking.find({
      eventId: { $in: eventIds },
      status: { $ne: "cancelled" },
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedBookings = bookings.map((booking) => {
      const event = events.find(
        (item) =>
          String(item._id) === String(booking.eventId)
      );

      return {
        ...booking,

        user: {
          _id: booking.userId || null,
          fullName: booking.fullName || "Unknown User",
          emailAddress:
            booking.emailAddress || "Email not available",
          number: booking.number || "Not available",
        },

        event: {
          _id: booking.eventId,
          title:
            booking.eventName ||
            event?.title ||
            "Unknown Event",
          date: booking.eventDate || event?.date || null,
          time: booking.eventTime || event?.time || null,
          location:
            booking.eventLocation ||
            event?.venueName ||
            event?.city ||
            "Location not available",
          image:
            booking.eventImage ||
            event?.imageUrl ||
            event?.image ||
            null,
        },

        amount: Number(
          booking.total ??
          booking.amount ??
          booking.totalAmount ??
          0
        ),

        totalAmount: Number(
          booking.total ??
          booking.amount ??
          booking.totalAmount ??
          0
        ),

        total: Number(
          booking.total ??
          booking.amount ??
          booking.totalAmount ??
          0
        ),
      };
    });

    const formattedEvents = events.map((event) => {
      const totalSeats = Number(
        event.maxCapacity ??
        event.totalSeats ??
        event.capacity ??
        event.numberOfSeats ??
        0
      );

      const bookedSeats = bookings
        .filter(
          (booking) =>
            String(booking.eventId) === String(event._id) &&
            booking.status !== "cancelled"
        )
        .reduce(
          (total, booking) =>
            total + Number(booking.quantity || 1),
          0
        );

      return {
        ...event,
        totalSeats,
        bookedSeats,
        seatsLeft: Math.max(totalSeats - bookedSeats, 0),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Creator bookings fetched successfully",
      bookings: formattedBookings,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Creator booking fetch failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Creator booking fetch failed",
    });
  }
};