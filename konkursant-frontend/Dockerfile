# Используем официальный образ Node.js версии 16 для сборки приложения
FROM node:20.17.0 AS build

# Установить рабочую директорию
WORKDIR /app

# Копировать package.json и package-lock.json
COPY package.json package-lock.json ./

# Установка зависимостей
RUN npm install

# Копировать остальные файлы проекта в контейнер
COPY . .

# Сборка React приложения
RUN npm run build

# Финальный образ на основе Nginx для сервировки собранных файлов
FROM nginx:alpine

# Копировать собранные файлы
COPY --from=build /app/build /usr/share/nginx/html

# Открыть порт 80 для доступа
EXPOSE 80

# Запустить Nginx
CMD ["nginx", "-g", "daemon off;"]
