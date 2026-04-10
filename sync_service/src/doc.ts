import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import * as Y from 'yjs';
import { LeveldbPersistence } from 'y-leveldb';
import path from 'path';
import { flushDocSnapshot } from './snapshot';
import { setPersistence, setupWSConnection } from 'y-websocket/bin/utils';

const persistence = new LeveldbPersistence(
  path.resolve(__dirname, '../yjs-data'),
);

setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    const persistedYdoc = await persistence.getYDoc(docName);
    const diff = Y.encodeStateAsUpdate(
      persistedYdoc,
      Y.encodeStateVector(ydoc),
    );
    Y.applyUpdate(ydoc, diff);

    ydoc.on('update', (update: Uint8Array) => {
      persistence.storeUpdate(docName, update);
    });
  },

  writeState: async (docName: string, ydoc: Y.Doc) => {
    await flushDocSnapshot(docName, ydoc);
  },
});

export function attachDocWebSocketServer(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(
      request.url ?? '/',
      `http://${request.headers.host}`,
    );

    if (pathname === '/doc') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    setupWSConnection(ws, req);
    console.info(`[doc] new connection: ${req.url}`);
  });

  console.info('[doc] WebSocket server attached at path /doc');
}
