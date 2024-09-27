# Импортируем необходимые библиотеки
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import os
import zipfile
from io import BytesIO

# Определяем путь к папке для архивирования
RESOURCE_FOLDER = "src/_resources"

downloader_router = APIRouter()

# Эндпоинт для скачивания информации в виде ZIP-архива
@downloader_router.get("/resources", response_class=StreamingResponse)
async def download_resources():
    # Проверяем, существует ли папка с ресурсами
    if not os.path.exists(RESOURCE_FOLDER):
        raise HTTPException(status_code=404, detail="Папка ресурсов не найдена")

    # Создаем буфер для хранения архива
    zip_buffer = BytesIO()

    # Создаем ZIP-архив
    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Проходим по всем файлам в папке ресурсов
            for root, _, files in os.walk(RESOURCE_FOLDER):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, RESOURCE_FOLDER)  # Упрощаем путь к файлу в архиве
                    zip_file.write(file_path, arcname)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания ZIP-архива: {str(e)}")

    # Перемещаем указатель в начало буфера
    zip_buffer.seek(0)

    # Возвращаем StreamingResponse с заголовками для скачивания
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",  # Используем правильный медиаплейт
        headers={
            "Content-Disposition": "attachment; filename=resources.zip"
        }
    )
