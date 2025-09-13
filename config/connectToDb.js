const mongoose = require("mongoose");

let isConnected = false; // Track connection state

const dbconnect = async () => {
  if (isConnected) {
    // already connected
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 30000, // wait up to 30s before timing out
    });

    isConnected = conn.connections[0].readyState;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports = dbconnect;
