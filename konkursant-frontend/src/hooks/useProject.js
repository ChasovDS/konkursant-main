import { useState } from 'react';
import { createProject,  handleDeleteProject } from '../services/projectService';

const useProject = () => {
    const [newProject, setNewProject] = useState({ title: '', description: '', file: null });
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);

    // Обработчик изменений ввода
    const handleInputChange = (e) => {
        setNewProject({ ...newProject, [e.target.name]: e.target.value });
    };

    // Обработчик выбора файла
    const handleFileChange = (e) => {
        setNewProject({ ...newProject, file: e.target.files[0] });
    };

    // Создание проекта
    const handleProjectCreate = async (refreshProjects) => {
        // Валидация полей
        if (!newProject.title) {
            setError('Заголовок проекта обязателен.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newProject.title);
            if (newProject.description) {
                formData.append('description', newProject.description);
            }
            if (newProject.file) {
                formData.append('docs_file', newProject.file);
            }

            await createProject(formData);
            refreshProjects(); // Обновляем список проектов
            setSuccessMessage('Проект успешно создан!');
            setError(''); // Сброс ошибки
        } catch (err) {
            console.error('Ошибка создания проекта:', err);
            setError('Ошибка создания проекта. Пожалуйста, попробуйте снова.');
        }
    };



    // Удаление проекта
    const deleteProject = async (id) => {
        try {
            await handleDeleteProject(id);
            setSelectedProject(null); // Сбрасываем выбранный проект
        } catch (error) {
            console.error('Ошибка удаления проекта:', error);
            setError('Ошибка удаления проекта.');
        }
    };

    // Вернуться к списку проектов
    const handleBack = () => {
        setSelectedProject(null);
    };

    return {
        newProject,
        setNewProject,
        successMessage,
        error,
        selectedProject,
        handleInputChange,
        handleFileChange,
        handleProjectCreate,
        deleteProject,
        handleBack,
        setError,
    };
};

export default useProject;
