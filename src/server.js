import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { setupGameSockets } from './sockets/game.socket.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Socket.IO server initialization
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true
    }
  });

  // Attach optional game socket events
  setupGameSockets(io);

  server.listen(config.port, () => {
    logger.info(`[GeoCircle Server]: Listening on port ${config.port} in ${config.env} mode`);
    logger.info(`[Config]: Default Timezone: ${config.defaultTimezone} | Max GPS Accuracy: ${config.maxAllowedAccuracy}m`);
  });

  // Process Unhandled Rejections / Exceptions
  process.on('unhandledRejection', (err) => {
    logger.error('[Unhandled Rejection]:', err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('[Uncaught Exception]:', err);
    process.exit(1);
  });
};

startServer();
