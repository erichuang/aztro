import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase } from './database.js';
import { setupRoutes } from './routes.js';
import { setupWebSocket } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Setup database
const db = await setupDatabase();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Create HTTP server
const server = createServer(app);

// Setup WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
const wsHandlers = setupWebSocket(wss);

// Setup routes with WebSocket handlers
setupRoutes(app, db, wsHandlers);

// Serve React app for all non-API routes
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Aztro is ready at http://localhost:${PORT}`);
});
