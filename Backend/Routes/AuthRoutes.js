import express from "express";
import {
	bookingUp,
 updateProfile,
	login,
	register,
	verifyRegisterOtp
	
} from "../Controllers/AuthContro.js";
import {requireAuth} from "../Middleware/auth.js"
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/verify-register-otp", verifyRegisterOtp);
authRouter.post("/login", login);
authRouter.post("/book", bookingUp);
authRouter.patch("/profile/edit", requireAuth,updateProfile )


export default authRouter;