import multer from "multer";
import { storage } from "../Config/Cloudinary.js";

const upload = multer({ storage });

export default upload;