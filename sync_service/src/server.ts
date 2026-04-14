import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { handleHttpRequest } from './http/router.js';
import { registerElementsNamespace } from './namespaces/elements.js';
import { registerCursorsNamespace } from './namespaces/cursors.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const PORT = Number(process.env.PORT) || 1234;
const FRONTEND_ORIGIN = process.env.FRONTEND_URI ?? '*';
const BACKEND_ORIGIN = process.env.BACKEND_URI ?? '(not set)';

const httpServer = http.createServer(handleHttpRequest);

const io = new IOServer(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20_000,
  pingInterval: 25_000,
});

registerElementsNamespace(io);
registerCursorsNamespace(io);

httpServer.listen(PORT, () => {
  console.info(`sync_service running on port ${PORT}`);
  console.info(`  CORS origin : ${FRONTEND_ORIGIN}`);
  console.info(`  Backend URL : ${BACKEND_ORIGIN}`);
});
