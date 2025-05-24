import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
    
    });
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    process.exit(1); // Exit the process if DB fails to connect
  }
};

