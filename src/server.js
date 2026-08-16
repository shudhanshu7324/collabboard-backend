import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSockets(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
