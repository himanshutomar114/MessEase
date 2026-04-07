import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; // Make sure you have the DB_NAME constant in constants.js

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME, // Specifying the database name
    });

    console.log(
      `\nMongoDB connected successfully! HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the process with failure if DB connection fails
  }
};

export default connectDB;
