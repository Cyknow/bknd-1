
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

//To see exactly what the server thinks it's doing, add this middleware at the very top of your middleware stack (right after creating the Express app). It will log every incoming request's method and URL, giving you a clear trace of all requests hitting your server. This is especially useful for debugging issues related to routing, CORS, or any middleware that might be interfering with requests. Just remember to remove or disable this logging in production to avoid cluttering your logs and potentially exposing sensitive information.
app.use((req, res, next) => {
  console.log(`DEBUG: Method: ${req.method} | URL: ${req.url}`);
  next();
});

// ✅ Add this line! 
// '1' tells Express to trust the first hop (Render's proxy)
app.set('trust proxy', 1);

// 🛡️ HIDDEN VANGUARD PROTOCOL: Remove the "Express" fingerprint
app.disable('x-powered-by');
const PORT = process.env.PORT || 6199;

// 2. DATABASE CONNECTION
connectDB(); // Cleaned: Removed the floating 'mongoose' word

// 3. GLOBAL MIDDLEWARE
app.use(helmet());

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'wccnigeria.vercel.app', // Your React/Vite URL
//   credentials: true 
// }));

app.use(
  cors({
    origin: "https://wccnigeria.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// app.use(cors({
//   origin: [
//     'http://localhost:5173', // Local development
//     'https://your-frontend-domain.com' // ✅ ADD YOUR DEPLOYED FRONTEND URL HERE
//   ],
//   credentials: true
// }));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   // ✅ Disable the specific check causing the crash
//   validate: { xForwardedForHeader: false }, 
// });

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
app.use('/auth', authRoutes);
app.use('/user-mgt', userMgtRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'WCC APIs is running...' });
});

const requiredEnv = ["VITE_API_URL", "FRONTEND_URL"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
});

// 5. Catch-all for Express 5
// Using '/*path' is the most stable naming convention for Express 5
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError('Access restricted or endpoint does not exist.', 404));
});
// app.all('/*path', (req: Request, res: Response, next: NextFunction) => {
//   next(new AppError('Access restricted or endpoint does not exist.', 404));
// });

// 6. GLOBAL ERROR HANDLER (MUST be last)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});