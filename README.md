# foggy

### Start project

- [установите клиент](https://www.mongodb.com/try/download/community) для MongoDB;
- установите Node.js `v20.14.0` или выше;
- установите менеджер пакетов pnpm: `npm install -g pnpm` 

  *(он будет установлен глобально с флагом `-g`);*
- запустите в корневой директории следующие команды:

    `pnpm install`, чтобы установить зависимости;
    
    `pnpm dev`, чтобы запустить проект для разработки;
    
    `pnpm start`, чтобы запустить build проекта.
#### Зависимости
Наш проект использует три workspace для установки зависимостей:
- `package.json` - глобальный:

  *содержит dev-зависимости, lock-файл, а также управляет двумя локальными workspace;*
- `backend/package.json` - backend:

  *содержит как dev, так и production-зависимости бэкенда;*
- `frontend/package.json` - frontend:

  *содержит как dev, так и production-зависимости фронтенда; связан с внешним файлом `.npmrc`, который позволяет 
установить библиотеку компонентов NextUI в root-папку `node_modules`.*

Workspaces контролируются файлом `pnpm-workspaces.yaml`, а lock-файл `pnpm-lock.yaml` содержит полную информацию обо 
всех зависимостях для каждого workspace.
#### Flow model
Мы придерживаемся модели GitFlow:
- `develop` - самая актуальная версия проекта;
- `master` - состояние проекта на момент последнего релиза;
- `FOGGY-n` - features из `develop`, сливаемые после окончания разработки с ней же;
- `hotfix-<title>` - коммиты напрямую в `master`, исправляющие мелкие ошибки;
- `release v<major_v>.<minor_v>.<hotfix_n>` - PR (релизов) из `develop` в `master`.
### Deploy
##### Docker
Docker использует переменные окружения, отличные от переменных окружения development. 
Это необходимо для корректного подключения контейнера бэкенда к контейнеру базы данных; при поднятии контейнеров 
`NODE_ENV` меняется на `production` (в файле docker-compose), и переменная окружения `MONGO_URI` меняется в 
соответствии с адресом базы данных в Docker и используется бэкендом для подключения к базе данных при 
`NODE_ENV='production'`.

**Важно:** так как окружение меняется на `production`, dev-зависимости не будут работать в контейнерах.

##### Переменные окружения
Можно настраивать все переменные окружения, упомянутые в файле `.env`, кроме `FRONTEND_PORT`, значение которого 
необходимо изменять другими способами.

#### Render

Мы хостим [api](https://foggy-backend.onrender.com/api) и [frontend](https://foggy.onrender.com) на Render.

**Важно:** re-деплой прилложения происходит при каждом обновлении файлов в ветке `master`; если обновления 
незначительные и re-деплой не нужен, то можно включить в текст коммита `[skip render]`.