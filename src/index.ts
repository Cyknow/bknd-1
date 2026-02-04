import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';


// Import your logic
import authRoutes from './routes/authRoutes';
import globalErrorHandler from './controllers/errorController';
import AppError from './utils/appError';
import connectDB from './config/db'; // Using the production standard DB function we created
import userMgtRoutes from './routes/userMgtRoutes';

// 1. CONFIGURATION
dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 6199;

// 2. DATABASE CONNECTION
mongoose
connectDB();

// 3. GLOBAL MIDDLEWARE
// Set security HTTP headers (Must be at the top)
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // Your React/Vite URL
  credentials: true   // Allows the browser to send cookies to the server
}));

// Rate Limiting: General API protection
const limiter = rateLimit({
  max: 100, // 100 requests per IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser());

// 1. Body parser (limit to 10kb for security)
app.use(express.json({ limit: '10kb' }));

// 2. Data sanitization against NoSQL query injection
// MUST be placed after the body parser
app.use(mongoSanitize());

// ... after mongoSanitize
app.use(xss());

// DATA SANITIZATION: Against NoSQL query injection
// This prevents attacks like: { "email": { "$gt": "" }, "password": "any" }
// app.use(mongoSanitize());

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 4. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user-mgt', userMgtRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Vanguard API is running...' });
});

// 5. ERROR HANDLING
// Handle undefined routes
// 1. Handle unhandled routes (404)

// ✅ The newer, safer way to handle catch-all routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `Can't find ${req.originalUrl} on this server!`
//   });
// });

// Global error handler (MUST be at the bottom)
app.use(globalErrorHandler);

// 6. START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});









// import express, { Application, Request, Response } from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import globalErrorHandler from './controllers/errorController';
// import helmet from 'helmet';

// // Import your Routes
// import authRoutes from './routes/authRoutes';

// // 1. CONFIGURATION
// dotenv.config();
// const app: Application = express();
// const PORT = process.env.PORT || 5000;

// // 2. DATABASE CONNECTION
// const DB = process.env.DATABASE_URL?.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD as string
// ) || 'mongodb://localhost:27017/vanguard';

// mongoose
//   .connect(DB)
//   .then(() => console.log('✅ MongoDB Connection Successful'))
//   .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// // 3. GLOBAL MIDDLEWARE
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your Vite/React URL
//   credentials: true // Crucial for sending/receiving JWT cookies
// }));

// app.use(express.json({ limit: '10kb' })); // Body parser
// app.use(cookieParser()); // Parses cookies for our protect middleware

// // 4. ROUTES
// app.use('/api/v1/auth', authRoutes);

// // Health Check
// app.get('/', (req: Request, res: Response) => {
//   res.status(200).json({ message: 'Vanguard API is running...' });
// });

// // 5. GLOBAL ERROR HANDLER (Catch-all)
// app.use((err: any, req: Request, res: Response, next: any) => {
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     status: err.status || 'error',
//     message: err.message || 'Internal Server Error',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//   });
// });

// // Set security HTTP headers (Must be at the top of your middleware)
// app.use(helmet());

// //Global error handler
// app.use(globalErrorHandler);


// // 6. START SERVER
// app.listen(PORT, () => {
//   console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });




// import express, { Application } from "express";
// import dotenv from "dotenv";
// import chalk from 'chalk';
// import bodyParser from "body-parser";
// import cors from "cors";
// import connectDB from "./config/db";

// dotenv.config();

// const app: Application = express();
// const PORT = process.env.PORT || 41074;

// // Connect to Database
// connectDB();

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // Routes
// app.use("/api/User", UserRoute);
// app.use("/api/Emails", EmailRoute);

// // Server listener
// app.listen(PORT, () => {
//   console.log(chalk.bgMagenta(`Server running on port ${PORT}`));
// });