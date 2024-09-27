import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import useFetchUserData from '../hooks/useFetchUserData';
import useProject from '../hooks/useProject';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';
import ProjectList from '../components/ProjectList';
import ProjectDetail from '../components/ProjectDetails';
import CreateProjectModal from '../components/CreateProjectModal';
import AlertSnackbar from '../components/AlertSnackbar';



const Workspace = () => {
    const { user, projects, error, loading } = useFetchUserData(); // Хук для получения данных пользователя и проектов
    const {
        newProject,
        handleInputChange,
        handleFileChange,
        handleProjectCreate,
        openProjectDetails,
        deleteProject,
        selectedProject,
        setError,
    } = useProject();

    const navigate = useNavigate(); // Хук для навигации
    const [modalOpen, setModalOpen] = useState(false); // Состояние для управления модальным окном создания проекта
    const [successMessage, setSuccessMessage] = useState(''); // Состояние для сообщения об успехе

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setError('');
        setSuccessMessage(''); // Сброс сообщения об успехе при закрытии
    };

    const handleLogout = async () => {
        const result = await logout(); // Выход из аккаунта
        if (result) {
            navigate('/'); // Переход на главную страницу
        } else {
            navigate('/'); // Переход на страницу "У вас нет доступа"
        }
    };

    if (loading) {
        return <LoadingScreen />; // Показать экран загрузки
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, p: 2 }}>
                <Typography color="error">Произошла ошибка: {error}</Typography> {/* Отобразить сообщение об ошибке */}
            </Box>
        );
    }

    return (
        <>
            <Header user={user} onLogout={handleLogout} />

            <Box sx={{ p: 2 }}>
                {selectedProject ? (
                    <ProjectDetail project={selectedProject} onLogout={handleLogout} user={user} />
                ) : (
                    <ProjectList
                        projects={projects}
                        user={user}
                        openProjectDetails={openProjectDetails}
                        handleModalOpen={handleModalOpen}
                        deleteProject={deleteProject}
                    />
                )}
            </Box>

            <CreateProjectModal
                open={modalOpen}
                onClose={handleModalClose}
                newProject={newProject}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleProjectCreate={handleProjectCreate}
                setSuccessMessage={setSuccessMessage}
            />

            <AlertSnackbar
                open={!!error}
                onClose={() => setError('')}
                message={error}
                severity="error"
            />
            <AlertSnackbar
                open={!!successMessage}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
                severity="success"
            />
        </>
    );
};

export default Workspace;
