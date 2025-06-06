# Используем официальный Node.js образ в качестве базового
FROM node:18-alpine

LABEL authors="MINTCanella"

# Устанавливаем рабочую директорию в контейнере
RUN mkdir /foggy
WORKDIR /foggy

# Копируем package.json и pnpm-lock.yaml в рабочую директорию
COPY package.json pnpm-workspace.yaml ./

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Копируем остальные файлы проекта в контейнер
COPY . .

# Устанавливаем зависимости
RUN pnpm install && cd backend && pnpm install

# Открываем порт
EXPOSE 3001

# Запуск приложения
CMD ["pnpm", "start"]