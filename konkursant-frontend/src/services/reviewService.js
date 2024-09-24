import axios from 'axios';

// URL вашего API
const API_URL = 'http://localhost:8000/reviews'; 

// Функция для получения отзывов конкретного проекта
export const getProjectReviews = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, { 
            withCredentials: true // Опция для отправки кук с запросом
        });

        return response.data; // Возвращаем полученные данные
    } catch (error) {
        console.error('Ошибка получения отзывов проекта:', error);
        throw error; // Пробрасываем ошибку выше для дальнейшей обработки
    }
}; 

// Функция для получения всех проверенных отзывов проектов
export const getAllProjectsReviews = async () => {
    try {
        const response = await axios.get(`${API_URL}/verified_projects`, { 
            withCredentials: true // Опция для отправки кук с запросом
        });

        return response.data; // Возвращаем полученные данные
    } catch (error) {
        console.error('Ошибка получения отзывов проектов:', error);
        throw error; // Пробрасываем ошибку выше для дальнейшей обработки
    }
}; 
