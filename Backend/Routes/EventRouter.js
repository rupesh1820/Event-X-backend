import express from "express"
import {getMyEvents, eventCreate, GetallEvent, GetEventById, getMyBookings, getCreatorBookings, cancelMyBooking }  from "../Controllers/EventCon.js"
import upload from "../Middleware/upload.js"
import {  requireAuth } from "../Middleware/auth.js"

const eventRouter = express.Router()

eventRouter.post("/event-create", requireAuth,  upload.single("image"), eventCreate );
eventRouter.get("/events", GetallEvent)
eventRouter.get("/events/:id", GetEventById)
eventRouter.get('/my-events', requireAuth, getMyEvents)
eventRouter.get('/my-bookings', requireAuth, getMyBookings)
eventRouter.get('/creator/bookings', requireAuth, getCreatorBookings)

eventRouter.patch("/my-bookings/:id/cancel",
  requireAuth,
  cancelMyBooking)
export default eventRouter;