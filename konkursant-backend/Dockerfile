# Используем официальный образ Python
FROM python:3.11

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код и необходимые файлы
COPY ./src ./src
COPY .env .         
COPY ./alembic ./alembic   
COPY alembic.ini .   

# Открываем порт приложения
EXPOSE 8000

# Команда для запуска приложения
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
