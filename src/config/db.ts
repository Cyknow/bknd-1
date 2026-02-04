import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error(chalk.red.bold("❌ ERROR: MONGO_URL is missing in .env"));
    process.exit(1);
  }

  // 1. Production Configuration Options
  const options = {
    autoIndex: true, // Build indexes (set to false for massive existing DBs)
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    const conn = await mongoose.connect(mongoUrl, options);
    
    console.log(
      chalk.bgCyan.black(` 🍃 MongoDB Connected: ${conn.connection.host} `)
    );

    // 2. Monitoring Connection Events
    mongoose.connection.on("error", (err) => {
      console.error(chalk.red(`MongoDB runtime error: ${err}`));
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(chalk.yellow("MongoDB disconnected. Attempting to reconnect..."));
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.bgRed.white.bold(` ❌ Connection Error: ${error.message} `));
    }
    process.exit(1);
  }
};

// 3. Handle Graceful Shutdown (for SIGINT / SIGTERM)
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(chalk.magenta("MongoDB connection closed through app termination"));
  process.exit(0);
});

export default connectDB;





// import mongoose from "mongoose";
// import chalk from "chalk";

// // Database connection function
// const connectDB = async (): Promise<void> => {
//   try {
//     if (!process.env.MONGO_URL) {
//       throw new Error("MONGO_URL is not defined in environment variables");
//     }
//     const connect = await mongoose.connect(process.env.MONGO_URL);
//     console.log(chalk.bgCyan (`MongoDB Connected: ${connect.connection.host}`));
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// export default connectDB;