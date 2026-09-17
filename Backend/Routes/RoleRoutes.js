import express from 'express'

export const Rolerouter = express.Router();
import { requireAdmin, requireAuth } from "../Middleware/auth.js";

import { getPendingEvents, approveEvent } from "../Controllers/EventCon.js";
Rolerouter.get(
  "/admin/events",
  requireAuth,
  requireAdmin,
  getPendingEvents
);

Rolerouter.patch(
  "/admin/events/:id/approve",
  requireAuth,
  requireAdmin,
  approveEvent
);