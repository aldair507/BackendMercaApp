import mongoose from "mongoose";
import { DB_URI } from "./server.config";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URI as string);
    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
