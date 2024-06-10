import { v2 as cloudinary } from "cloudinary";
import env from "dotenv";
env.config();
cloudinary.config({
  api_secret: process.env.API_SECRET,
  api_key: process.env.API_KEY,
  cloud_name: process.env.CLOUD_NAME,
});

export default cloudinary;
