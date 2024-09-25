# Используем официальный Node.js образ
FROM node:16 as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем источники и строим проект
COPY . .
RUN npm run build

# Устанавливаем сервер для статических файлов
FROM nginx:alpine

# Копируем подготовленный build в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Открываем порт приложения
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]
