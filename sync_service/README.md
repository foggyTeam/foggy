# sync_service

Микросервис реального времени для проекта **foggy**.  
Принимает все WebSocket-соединения от фронтенда, держит состояние активных досок в памяти и периодически сбрасывает снапшоты на бэкенд через REST.

## Архитектура

### Неймспейсы socket.io

```
/             - курсоры (аналог BoardGateway)
/elements     - операции с элементами (аналог BoardElementsGateway)
```

Оба неймспейса живут на одном HTTP-сервере и одном порту.

### Неймспейс `/elements`

**Auth при подключении** (передаётся фронтендом в `socket.handshake.auth`):

```typescript
{
  boardId: string;
  boardType?: 'SIMPLE' | 'GRAPH' | 'DOC';
}
```

**Headers:**

```
x-user-id: <userId>
```

**Ивенты SIMPLE-доски:**

| Ивент (приём)        | Данные                              | Ивент (broadcast)    |
| -------------------- | ----------------------------------- | -------------------- |
| `addElement`         | `element: any`                      | `elementAdded`       |
| `updateElement`      | `{ id, newAttrs }`                  | `elementUpdated`     |
| `removeElement`      | `id: string`                        | `elementRemoved`     |
| `changeElementLayer` | `{ id, prevPosition, newPosition }` | `changeElementLayer` |

**Ивенты GRAPH-доски:**

| Ивент (приём)    | Данные                         | Ивент (broadcast) |
| ---------------- | ------------------------------ | ----------------- |
| `nodesUpdate`    | `NodeChange[]`                 | `nodesUpdate`     |
| `edgesUpdate`    | `EdgeChange[]`                 | `edgesUpdate`     |
| `nodeDataUpdate` | `{ nodeId, newAttrs, isNew? }` | `nodeDataUpdate`  |

### Неймспейс `/` (курсоры)

**Auth при подключении:**

```typescript
{
  id: string;
  nickname: string;
  avatar: string;
  color: string;
  boardId: string;
}
```

**Ивенты:**

| Ивент (приём) | Данные                          | Ивент (broadcast)                    |
| ------------- | ------------------------------- | ------------------------------------ |
| `cursorMove`  | `{ id, nickname, color, x, y }` | `cursorMove` (+ `avatar`, `boardId`) |
| `disconnect`  | —                               | `userDisconnected`                   |

Координаты курсора (`x`, `y`) — в координатах пространства доски, не экранных.

### HTTP

```
GET /health  -  200 "ok"
```
---
```
`GET /boards/:id/snapshot`
```
Возвращает текущее in-memory состояние активной доски.  
Доска должна быть открыта в браузере - если комната не существует, вернёт 404.

**Авторизация:**
---

## In-memory state

Каждая активная доска - это **Room**:

```typescript
interface Room {
  boardId: string;
  type: BoardType;
  state: SimpleBoardState | GraphBoardState | null;
  dirty: boolean; // true если state изменился с последнего POST
  snapshotTimer: ReturnType<typeof setInterval> | null;
}
```

Состояние мутирует на каждый ивент.  
Комната создаётся при первом подключении к доске и удаляется, когда уходит последний пользователь (с финальным flush снапшота).

---

## Снапшоты

Это главная точка интеграции с бэкендом. Логика в `src/snapshot.ts`.

### Что делает sync_service

1. **При создании комнаты** — `GET /boards/:id/snapshot` - начальное состояние.  
   Если эндпоинт не готов или возвращает не 200 - стартует с пустым состоянием.
2. **Каждые 10 секунд** - если `room.dirty === true`, делает `POST /boards/:id/snapshot` с текущим состоянием.
3. **При уходе последнего пользователя** - финальный `POST` перед удалением комнаты из памяти.

### Required backend endpoints

#### `GET /boards/:id/snapshot`

Возвращает последний сохранённый снапшот доски.

**Response для SIMPLE:**

```json
{
  "layers": [
    [
      { "id": "el-1", "type": "rect", "x": 100, "y": 200, ... },
      { "id": "el-2", "type": "text", "x": 50,  "y": 80,  ... }
    ],
    []
  ]
}
```

**Response для GRAPH:**

```json
{
  "nodes": [
    { "id": "n-1", "position": { "x": 100, "y": 200 }, "data": { ... } }
  ],
  "edges": [
    { "id": "e-1", "source": "n-1", "target": "n-2" }
  ]
}
```

#### `POST /boards/:id/snapshot`

Принимает тело в том же формате, что и ответ GET. Перезаписывает последний снапшот.

**Response:** `200 OK` (тело не важно).

#### Авторизация запросов

Оба эндпоинта должны быть закрыты от внешних вызовов. sync_service передаёт заголовок:

```
x-service-key: <SYNC_SERVICE_KEY>
```

На бэкенде нужно сверять его с переменной окружения `SYNC_SERVICE_KEY`.

## Переменные окружения

| Переменная         | Описание                                                |
| ------------------ |---------------------------------------------------------|
| `PORT`             | Порт сервиса. Render перезаписывает автоматически.      |
| `BACKEND_URI`      | URL бэкенда.                                            |
| `FRONTEND_URI`     | URL фронтенда. Используется для CORS в socket.io.       |
| `SYNC_SERVICE_KEY` | Секретный ключ для авторизации REST-запросов к бэкенду. |

## Запуск

```bash
pnpm i

# из папки sync_service
pnpm dev       # tsx watch - hot reload
pnpm build     # tsc -> dist/
pnpm start     # node dist/server.js
```

Проверка что поднялся:

```bash
curl http://localhost:1234/health
```
