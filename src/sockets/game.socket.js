import { logger } from '../utils/logger.js';

// Store active rooms in-memory
const activeRooms = new Map();

export const setupGameSockets = (io) => {
  const gameNamespace = io.of('/games');

  gameNamespace.on('connection', (socket) => {
    logger.info(`[Socket.IO Game]: Client connected ${socket.id}`);

    // Create a new multiplayer room with a unique room code
    socket.on('create_room', ({ gameTitle, user }) => {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const roomData = {
        roomCode,
        gameTitle,
        host: user,
        players: [{ socketId: socket.id, user }]
      };

      activeRooms.set(roomCode, roomData);
      socket.join(roomCode);

      logger.info(`[Socket.IO Game]: Room ${roomCode} created for ${gameTitle} by ${user?.name || socket.id}`);
      socket.emit('room_created', { roomCode, roomData });
    });

    // Join an existing room via Room Code
    socket.on('join_room_code', ({ roomCode, user }) => {
      const cleanCode = String(roomCode).trim();
      const room = activeRooms.get(cleanCode);

      if (!room) {
        socket.emit('room_error', { message: `Room code "${cleanCode}" not found or expired.` });
        return;
      }

      if (room.players.length >= 4) {
        socket.emit('room_error', { message: `Room "${cleanCode}" is full (Max 4 players).` });
        return;
      }

      const existing = room.players.find(p => p.socketId === socket.id);
      if (!existing) {
        room.players.push({ socketId: socket.id, user });
      }

      socket.join(cleanCode);
      logger.info(`[Socket.IO Game]: User ${user?.name || socket.id} joined room ${cleanCode}`);

      // Broadcast room update to all players in the room
      gameNamespace.to(cleanCode).emit('room_joined', { roomCode: cleanCode, roomData: room, newUser: user });
    });

    socket.on('join_lobby', ({ sessionId, user }) => {
      socket.join(sessionId);
      logger.info(`[Socket.IO Game]: User ${user?.name || socket.id} joined lobby ${sessionId}`);
      gameNamespace.to(sessionId).emit('player_joined', { user, socketId: socket.id });
    });

    socket.on('send_game_action', ({ roomCode, sessionId, action, payload }) => {
      const target = roomCode || sessionId;
      if (target) {
        socket.to(target).emit('game_action_received', { action, payload, sender: socket.id });
      }
    });

    socket.on('leave_lobby', ({ roomCode, sessionId, user }) => {
      const target = roomCode || sessionId;
      if (target) {
        socket.leave(target);
        gameNamespace.to(target).emit('player_left', { user, socketId: socket.id });

        if (roomCode && activeRooms.has(roomCode)) {
          const room = activeRooms.get(roomCode);
          room.players = room.players.filter(p => p.socketId !== socket.id);
          if (room.players.length === 0) {
            activeRooms.delete(roomCode);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO Game]: Client disconnected ${socket.id}`);
    });
  });
};
