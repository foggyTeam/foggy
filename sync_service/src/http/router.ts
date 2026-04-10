import http from 'http';
import { getRoom } from '../rooms';

export function handleHttpRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  const snapshotMatch = req.url?.match(/^\/boards\/([^/]+)\/snapshot$/);
  if (snapshotMatch && req.method === 'GET') {
    const serviceKey = req.headers['x-service-key'];
    if (serviceKey !== process.env.SYNC_VERIFICATION_KEY) {
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    const boardId = snapshotMatch[1];
    const room = getRoom(boardId);

    if (!room?.state) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Board not found or not active' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ boardId, type: room.type, state: room.state }));
    return;
  }

  res.writeHead(404);
  res.end();
}
