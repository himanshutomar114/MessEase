import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
  path: "./.env",
});


const allowedOrigins = [
  process.env.FRONTEND_URL || "https://mess-ease.vercel.app",
];

const app = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware to parse JSON bodies with increased size limit for timetable data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
