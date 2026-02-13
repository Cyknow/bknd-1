
//to resolve the issue of missing env variables when running the server, we need to ensure that the .env file is properly loaded at the very beginning of our application. This is crucial because other modules might rely on these environment variables during their initialization. By importing 'dotenv/config' at the top of our index.ts file, we ensure that all environment variables are available throughout the entire application lifecycle.
import 'dotenv/config';
console.log('API KEY CHECK:', process.env.SENDGRID_API_KEY ? 'LOADED ✅' : 'MISSING ❌');

import express, { Application, NextFunction, Request, Response } from 'express';
// import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import path from 'path';

// Import your logic
import authRoutes from './routes/authRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import connectDB from './config/db.js'; 
import userMgtRoutes from './routes/userMgtRoutes.js';

// // 1. CONFIGURATION
// dotenv.config();
// This forces Node to look in the root directory regardless of where you run the command
// dotenv.config({ path: path.join(process.cwd(), '.env') });

const app: Application = express();
// 🛡️ HIDDEN VANGUARD PROTOCOL: Remove the "Express" fingerprint
app.disable('x-powered-by');
const PORT = process.env.PORT || 6199;

// 2. DATABASE CONNECTION
connectDB(); // Cleaned: Removed the floating 'mongoose' word

// 3. GLOBAL MIDDLEWARE
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// app.use(express.json({ limit: '10kb' }));
// app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Advanced NoSQL Injection Protection
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (obj[key] && typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
  };
  [req.body, req.query, req.params].forEach(sanitize);
  next();
});

// ✅ This MUST come before your routes
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user-mgt', userMgtRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'WCC APIs is running...' });
});

// 5. Catch-all for Express 5
// Using '/*path' is the most stable naming convention for Express 5
app.all('/*path', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError('Access restricted or endpoint does not exist.', 404));
});

// 6. GLOBAL ERROR HANDLER (MUST be last)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});









// // import dns from 'node:dns';

// // // Force Node.js to use Google DNS for all resolutions
// // dns.setServers(['8.8.8.8', '8.8.4.4']);

// import express, { Application, NextFunction, Request, Response } from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// // import mongoSanitize from 'express-mongo-sanitize';
// // import xss from 'xss-clean';


// // Import your logic
// import authRoutes from './routes/authRoutes.js';
// import globalErrorHandler from './controllers/errorController.js';
// import AppError from './utils/appError.js';
// import connectDB from './config/db.js'; // Using the production standard DB function we created
// import userMgtRoutes from './routes/userMgtRoutes.js';

// // 1. CONFIGURATION
// dotenv.config();
// const app: Application = express();
// const PORT = process.env.PORT || 6199;

// // // 2. DATABASE CONNECTION
// mongoose
// connectDB();

// // 3. GLOBAL MIDDLEWARE or Strict Security Stack
// // Set security HTTP headers (Must be at the top)
// app.use(helmet());

// // CORS configuration
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // Your React/Vite URL
//   credentials: true   // Allows the browser to send cookies to the server
// }));

// // Rate Limiting: General API protection
// const limiter = rateLimit({
//   max: 100, // 100 requests per IP
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// // Optimized Parser or Body parser, reading data from body into req.body
// app.use(express.json({ limit: '10kb' }));

// // app.use(express.urlencoded({extended:true}))
// app.use(cookieParser());

// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1);
// }

// /**
//  * Advanced NoSQL Injection Protection
//  * Recursively strips keys starting with '$' or containing '.' 
//  * from req.body, req.query, and req.params.
//  */
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const sanitize = (obj: any) => {
//     if (obj && typeof obj === 'object') {
//       Object.keys(obj).forEach((key) => {
//         // 1. Check if the key is dangerous
//         // We check for '$' at the start and '.' anywhere in the key
//         if (key.startsWith('$') || key.includes('.')) {
//           delete obj[key];
//         } 
//         // 2. If the value is another object/array, dig deeper
//         else if (obj[key] && typeof obj[key] === 'object') {
//           sanitize(obj[key]);
//         }
//       });
//     }
//   };

//   // Clean all three primary input sources
//   [req.body, req.query, req.params].forEach(sanitize);

//   next();
// });

// // 4. ROUTES
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/user-mgt', userMgtRoutes);

// // Health Check
// app.get('/', (req: Request, res: Response) => {
//   res.status(200).json({ message: 'Vanguard API is running...' });
// });

// // 5.Catch-all for Express 5 ERROR HANDLING, 
// // Handle undefined routes Handle unhandled routes (404)
// app.all('/*splat', (req, res, next) => {
//   next(new AppError(`Route ${req.originalUrl} not found`, 404));
// });

// // Global error handler (MUST be at the bottom)
// app.use(globalErrorHandler);

// // 6. START SERVER
// app.listen(PORT, () => {
//   console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });







// ✅ The newer, safer way to handle catch-all routes
// app.all(/.*/, (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `Can't find ${req.originalUrl} on this server!`
//   });
// });

// 2. Data sanitization against NoSQL query injection
// MUST be placed after the body parser
// app.use(
//   mongoSanitize({
//     replaceWith: "_",
//     sanitizeQuery: false, // REQUIRED
//   })
// );

// app.use((req, _res, next) => {
//   const dangerousKeys = ["$", "."];
//   for (const key of Object.keys(req.body || {})) {
//     if (dangerousKeys.some(d => key.includes(d))) {
//       delete req.body[key];
//     }
//   }
//   next();
// });


// ... after mongoSanitize
// app.use(xss());

// DATA SANITIZATION: Against NoSQL query injection
// This prevents attacks like: { "email": { "$gt": "" }, "password": "any" }
// app.use(mongoSanitize());


// // 3. Custom NoSQL Injection Protection (Simple & Modern)
// app.use((req, res, next) => {
//   const sanitize = (obj: any) => {
//     if (obj instanceof Object) {
//       for (const key in obj) {
//         if (key.startsWith('$')) delete obj[key];
//         else sanitize(obj[key]);
//       }
//     }
//   };
//   sanitize(req.body);
//   sanitize(req.query);
//   next();
// });






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