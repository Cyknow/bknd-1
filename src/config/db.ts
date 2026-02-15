import mongoose from "mongoose";
import pkg from "picocolors";

const { bold } = pkg;

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error(pkg.red(bold("❌ ERROR: MONGO_URL is missing in .env")));
    process.exit(1);
  }

  // 1. Production Configuration Options
  const options = {
    autoIndex: true, 
    maxPoolSize: 10, 
    serverSelectionTimeoutMS: 10000, 
    socketTimeoutMS: 45000,
    /** * ✅ FIX FOR NODE 25+ DNS ISSUES:
     * Forces IPv4 resolution to prevent ECONNREFUSED/DNS errors 
     * common in new Node versions preferring IPv6.
     */
    family: 4, 
  };

  try {
    const conn = await mongoose.connect(mongoUrl, options);
    
    console.log(
      pkg.bgCyan(bold(` 🍃 MongoDB Connected: ${conn.connection.host} `)));

    // 2. Monitoring Connection Events
    mongoose.connection.on("error", (err) => {
      console.error(pkg.red(`MongoDB runtime error: ${err}`));
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(pkg.yellow("MongoDB disconnected. Attempting to reconnect..."));
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error(pkg.red(bold(` ❌ Connection Error: ${error.message} `)));
      
      // Insightful tip for the user:
      if (error.message.includes('ECONNREFUSED')) {
        console.log(pkg.yellow("💡 Tip: Check if your IP is whitelisted in MongoDB Atlas Network Access."));
      console.log(pkg.gray(`Attempting to connect to: ${mongoUrl?.split('@')[1]}`));
      }
    }
    process.exit(1);
  }
};

// 3. Handle Graceful Shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(pkg.magenta("MongoDB connection closed through app termination"));
  process.exit(0);
});

export default connectDB;