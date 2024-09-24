import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { getProjects } from '../services/projectService';

const useFetchUserData = () => {
    const [user, setUser] = useState(null); // Состояние для пользователя
    const [projects, setProjects] = useState([]); // Состояние для проектов
    const [error, setError] = useState(''); // Состояние для ошибок
    const [loading, setLoading] = useState(true); // Состояние загрузки

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true); // Устанавливаем состояние загрузки

            try {
                const userData = await getCurrentUser(); // Получаем данные пользователя
                setUser(userData); // Устанавливаем данные пользователя
                
                const projectData = await getProjects(); // Получаем проекты
                setProjects(projectData); // Устанавливаем данные проектов

            } catch (err) {
                // Обрабатываем ошибки
                setError('Ошибка получения данных пользователя. Пожалуйста, проверьте свою сессию.');
                console.error('Ошибка получения данных:', err);
            } finally {
                setLoading(false); // Сброс состояния загрузки в конце
            }
        };

        fetchUserData(); // Запускаем асинхронную функцию
    }, []); // Пустой массив зависимостей для выполнения один раз при монтировании компонента

    return { user, projects, error, loading }; // Возвращаем состояние загрузки и данные
};

export default useFetchUserData;
