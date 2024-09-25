import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

// URL вашего API
const API_URL = `${apiUrl}/reviews`;

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


/**
 * Создает отзыв для проекта.
 * @param {number} id - ID проекта.
 * @param {Object} reviewData - Данные отзыва.
 * @returns {Promise} - ОбPromise для обработки результата запроса.
 */
export const createReview = async (id, reviewData) => {
    try {
        const response = await axios.post(`${API_URL}/create_review/${id}`, reviewData, {
            withCredentials: true, // Отправляем куки с запросом
        });
        return response.data;
    } catch (error) {
        // Генерируем ошибку для обработки в компоненте
        throw error;
    }
};



/**
 * Получает проверенные проекты.
 * @returns {Promise} - ОбPromise для массива проектов.
 */
export const fetchVerifiedProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/verified_projects/`, { 
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};