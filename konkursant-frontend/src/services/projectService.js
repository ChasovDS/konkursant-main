import axios from 'axios';

const API_URL = '/projects'; // ваш API

// Функция для обработки ошибок
const handleApiError = (error, action) => {
    console.error(`Ошибка ${action}:`, error);
    throw new Error(`Ошибка ${action}: ${error.message}`);
};

// Функция получения проектов пользователя
export const getProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/all_access_projects/`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleApiError(error, 'получения проектов');
    }
};



// Функция создания нового проекта
export const createProject = async (projectData) => {
    try {
        const response = await axios.post(`${API_URL}/create/`, projectData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        handleApiError(error, 'создания проекта');
    }
};

// Функция для получения деталей конкретного проекта
export const getProjectDetails = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}/json-data`, { 
            withCredentials: true 
        });
        return response.data;
    } catch (error) {
        handleApiError(error, 'получения деталей проекта');
    }
}; 

// Функция удаления проекта
export const handleDeleteProject = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${id}/`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleApiError(error, 'удаления проекта');
    }
};

// Функция обновления ссылок на файлы
export const updateFileLinks = async (projectId, fileIds, fileLinks) => {
    try {
        const response = await axios.post(`${API_URL}/${projectId}/add-file-link/`, { file_ids: fileIds, file_links: fileLinks }, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleApiError(error, 'обновления ссылок на файлы');
    }
};