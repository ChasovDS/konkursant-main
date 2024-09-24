import React, { useState } from 'react';
import { logout } from '../services/authService';
import useFetchUserData from '../hooks/useFetchUserData';
import useProject from '../hooks/useProject';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';
import ProjectList from '../components/ProjectList';
import ProjectDetail from '../components/ProjectDetails';

import CreateProjectModal from '../components/CreateProjectModal';
import AlertSnackbar from '../components/AlertSnackbar';
import { useNavigate } from 'react-router-dom'; 

const Workspace = () => {
    const { user, projects, error, loading } = useFetchUserData();
    const {newProject, handleInputChange, handleFileChange,
        handleProjectCreate, openProjectDetails, deleteProject ,handleBack, selectedProject,
        setError,} = useProject();
        
    const navigate = useNavigate(); // Используем хук для навигации


    // Состояние для управления модальным окном создания проекта
    const [modalOpen, setModalOpen] = useState(false);
    // Состояние для сообщения об успехе
    const [successMessage, setSuccessMessage] = useState('');

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
            navigate('/no-access'); // Переход на страницу "У вас нет доступа"
        }
    };


    if (loading) {
        return <LoadingScreen />; // Показать экран загрузки
    }

    if (error) {
        return (
            <div>
                Произошла ошибка: {error} {/* Отобразить сообщение об ошибке */}
            </div>
        );
    }

    return (
        <>
            <Header user={user} onLogout={handleLogout} />
            
            {selectedProject ? (
                    <ProjectDetail project={selectedProject} onBack={handleBack} user={user}/>
                ) : (
                    <ProjectList 
                        projects={projects} 
                        user={user}
                        openProjectDetails={openProjectDetails}
                        handleModalOpen={handleModalOpen} 
                        deleteProject={deleteProject} 
                    />
                )}

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
