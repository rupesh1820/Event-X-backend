import User from "../Models/Users.js";
import Booking from "../Models/Bookings.js";



export const  getAlluser = async (req, res)=>{
  try {
    const users = await User.find().select("-password").sort({cretedAt:-1});
    res.status(200).json({
      success:true,
      users,


    });
  } catch (error) {
    console.error("get all user error: ", error)
    res.status(500).json({success:true, message:"Failed t fetch users"});
  }
};

export const deleteUser = async(req, res)=>{
  try {
    const{id}=req.params;
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({
        success:false, message:"User not found",
      });
    }
    if(user.role==='admin'){
      return res.status(403).json({
        success:false,
        message:"Admin user cannot be deleted"
      });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success:true,message:"User deleted Successfully",
    });
  } catch (error) {
    console.error("Deleted user error: ", error);
    res.status(500).json({
      success:false,
      message:"Failed to delete user"
    });
  }
};


export const GetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    const eventMap = new Map();

    bookings.forEach((booking) => {
      const eventId = booking.eventId || "unknown-event";

      const eventTitle = booking.eventName || "Unknown Event";

      const creatorName = "Unknown Creator";

      const quantity = Number(booking.quantity || 1);

      const amount = Number(booking.total || 0);

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId,
          eventTitle,
          creatorName,
          totalBookings: 0,
          totalTickets: 0,
          revenue: 0,
        });
      }

      const eventData = eventMap.get(eventId);

      eventData.totalBookings += 1;
      eventData.totalTickets += quantity;
      eventData.revenue += amount;
    });

    return res.status(200).json({
      success: true,
      bookings,
      eventSummary: Array.from(eventMap.values()),
    });
  } catch (error) {
    console.error("Get all admin bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin bookings",
      error: error.message,
    });
  }
};
