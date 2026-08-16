import express from 'express';
import rateLimit from 'express-rate-limit';
import prisma from './config/prisma.js';
import authRoutes from './modules/auth/auth.routes.js';
import workspaceRoutes from './modules/workspaces/workspaces.routes.js';
import activityRoutes from './modules/activity/activity.routes.js';
import { workspaceBoardRoutes, boardRoutes, listRoutes } from './modules/boards/boards.routes.js';
import { listTaskRoutes, boardTaskRoutes, taskRoutes } from './modules/tasks/tasks.routes.js';
import {
  taskCommentRoutes,
  taskAttachmentRoutes,
  commentRoutes,
} from './modules/comments/comments.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workspaces/:workspaceId/boards', workspaceBoardRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces', activityRoutes);
app.use('/api/boards/:boardId/tasks', boardTaskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists/:listId/tasks', listTaskRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks/:taskId/comments', taskCommentRoutes);
app.use('/api/tasks/:taskId/attachments', taskAttachmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.use(errorHandler);

export default app;
