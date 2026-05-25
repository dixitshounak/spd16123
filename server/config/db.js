const mongoose = require("mongoose");

/**
 * Connect to MongoDB with retry logic.
 */
const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection error: ${error.message}`);
      if (retries === 0) {
        console.error("💥 MongoDB connection failed after 5 retries. Exiting.");
        process.exit(1);
      }
      console.log(`🔄 Retrying MongoDB connection... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
