import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

let io;

export function getIO() {
  return io;
}

export function emitToBoard(boardId, event, payload) {
  if (io && boardId) {
    io.to(boardId).emit(event, payload);
  }
}

export function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { userId: decoded.userId, email: decoded.email };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:board', async (boardId) => {
      if (!boardId) return;
      const board = await prisma.board.findFirst({
        where: { id: boardId, deletedAt: null },
        select: { workspaceId: true },
      });
      if (!board) return;

      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: board.workspaceId,
          userId: socket.user.userId,
          deletedAt: null,
        },
      });
      if (!membership) return;

      socket.join(boardId);
    });

    socket.on('leave:board', (boardId) => {
      if (boardId) socket.leave(boardId);
    });
  });

  return io;
}
