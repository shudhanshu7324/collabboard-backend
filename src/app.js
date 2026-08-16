import express from 'express';
import prisma from './config/prisma.js';
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

export default app;
