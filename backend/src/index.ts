import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Security Middleware ---

// 1. Helmet: Set various HTTP headers to secure the app
app.use(helmet());

// 2. CORS: Restrict cross-origin requests
// In production, this should ideally be set exactly to the frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Defaulting to * for local dev if not set
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 3. Rate Limiting: Prevent Brute Force & DDoS attacks on endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);

// 4. Body Parser & HPP
app.use(express.json({ limit: '10mb' })); // Limit body payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

// File upload setup moved to api.ts to avoid circular dependency

// Routes
import { apiRouter } from './routes/api';
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
