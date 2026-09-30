import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { mongoSanitizeMiddleware, customSecurityHeaders } from './middleware/security.middleware.js';
import { globalApiLimiter } from './middleware/rateLimit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin/index.js';
import userRoutes from './routes/user.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import reportRoutes from './routes/report.routes.js';
import gameRoutes from './routes/game.routes.js';

const app = express();

// 1. Rate Limiting across all API endpoints
app.use('/api', globalApiLimiter);

// 2. Helmet Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allowed for leaflet map tile loading on client
    crossOriginEmbedderPolicy: false
  })
);

// 3. Custom Security Headers & Anti-Sniffing
app.use(customSecurityHeaders);

// 4. CORS configuration
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:80',
  'http://localhost:8081',
  'https://fmp-user.vercel.app',
  'https://fmp-admin-two.vercel.app'
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.some((o) => o.replace(/\/$/, '') === normalizedOrigin) ||
        config.env !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// 5. Body Parsers with 10kb size limits & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. NoSQL Injection Sanitizer
app.use(mongoSanitizeMiddleware);

// 7. Enhanced Server Health Check Route
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  let dbPingMs = null;
  if (isDbConnected && mongoose.connection.db) {
    const start = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - start;
    } catch {
      dbPingMs = -1;
    }
  }

  const memory = process.memoryUsage();

  res.status(200).json({
    success: true,
    status: isDbConnected ? 'UP' : 'DEGRADED',
    message: 'Server health check operational.',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      systemTime: new Date().toISOString(),
      environment: config.env,
      timezone: config.defaultTimezone,
      database: {
        status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
        readyState: dbState,
        dbName: mongoose.connection.name || 'geocircle',
        pingLatencyMs: dbPingMs
      },
      memoryUsage: {
        rssMB: (memory.rss / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(2),
        heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(2)
      },
      security: {
        rateLimiterActive: true,
        noSqlSanitizerActive: true,
        helmetActive: true,
        corsOrigin: config.clientUrl
      },
      features: {
        maxAllowedAccuracyMeters: config.maxAllowedAccuracy,
        gamesModuleEnabled: config.gamesModuleEnabled
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Dedicated Admin Module Routes
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/games', gameRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
    code: 'NOT_FOUND'
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;