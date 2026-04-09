import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app } from "./util/socket.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
  path: "./.env",
});


const allowedOrigins = [
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());
