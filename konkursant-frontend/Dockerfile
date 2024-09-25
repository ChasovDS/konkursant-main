# Используем официальный Node.js образ
FROM node:16 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем источники и строим проект
COPY . .
RUN npm run build

# Устанавливаем сервер для статических файлов
FROM node:16 AS production
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve

# Открываем порт приложения
EXPOSE 3000

# Команда для запуска приложения
CMD ["serve", "-s", "build"]
