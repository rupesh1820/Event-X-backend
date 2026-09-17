import express from "express";

import {
  getAlluser,
  deleteUser,
  GetAllBookings,
} from "../Controllers/AdminuserControler.js";
import { requireAdmin, requireAuth } from "../Middleware/auth.js";

const AdminRouter = express.Router();
AdminRouter.get("/users", requireAuth, requireAdmin, getAlluser);

AdminRouter.delete("/users/:id", requireAuth, requireAdmin, deleteUser);

AdminRouter.get("/bookings", requireAuth, requireAdmin, GetAllBookings);


export default AdminRouter;
