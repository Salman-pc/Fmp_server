import { logger } from '../utils/logger.js';

export const setupGameSockets = (io) => {
  const gameNamespace = io.of('/games');

  gameNamespace.on('connection', (socket) => {
    logger.info(`[Socket.IO Game]: Client connected ${socket.id}`);

    socket.on('join_lobby', ({ sessionId, user }) => {
      socket.join(sessionId);
      logger.info(`[Socket.IO Game]: User ${user?.name || socket.id} joined lobby ${sessionId}`);
      gameNamespace.to(sessionId).emit('player_joined', { user, socketId: socket.id });
    });

    socket.on('send_game_action', ({ sessionId, action, payload }) => {
      socket.to(sessionId).emit('game_action_received', { action, payload, sender: socket.id });
    });

    socket.on('leave_lobby', ({ sessionId, user }) => {
      socket.leave(sessionId);
      gameNamespace.to(sessionId).emit('player_left', { user, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO Game]: Client disconnected ${socket.id}`);
    });
  });
};
