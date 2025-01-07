# Используем официальный Node.js образ в качестве базового
FROM node:18-alpine

LABEL authors="Icicle Icifur"

RUN mkdir /foggy
WORKDIR /foggy

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-workspace.yaml .npmrc ./

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Копируем остальные файлы проекта в контейнер
COPY . .

# Устанавливаем зависимости
RUN pnpm install && cd frontend && pnpm install
RUN pnpm build

# Открываем порт
EXPOSE 3000

# Запуск приложения
CMD ["pnpm", "start"]