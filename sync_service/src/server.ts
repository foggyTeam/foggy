import 'dotenv/config';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 1234;

/**HTTP Server has only /health endpoint for Render's healthcheck.**/
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  console.info('NEW CONNECTION:', req.url);

  ws.on('message', (data) => {
    console.info('MESSAGE:', data.toString());
  });

  ws.on('close', () => {
    console.info('DISCONNECTED');
  });
});

httpServer.listen(PORT, () => {
  console.info(`sync_service running on port ${PORT}`);
});
