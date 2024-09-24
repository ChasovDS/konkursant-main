import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Modal, CircularProgress, FormControl, FormHelperText
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateProjectModal = ({
    open, onClose, newProject, handleInputChange,
    handleProjectCreate
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        title: '',
        file: ''
    });
    
    // Состояние для хранения загруженного файла
    const [file, setFile] = useState(null);

    // Вспомогательная функция для проверки наличия ошибок
    const validateInputs = () => {
        const errors = {};
        
        if (!newProject.title) {
            errors.title = 'Пожалуйста, введите название проекта.';
        }
        if (!file) { // Проверяем состояние file вместо newProject.file
            errors.file = 'Пожалуйста, загрузите файл проекта.';
        }

        setError(errors);
        return Object.keys(errors).length === 0;
    };

    // Обработка загрузки файла
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        
        // Проверка формата файла
        if (selectedFile && selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setError(prevState => ({
                ...prevState,
                file: 'Файл должен быть в формате .docx.'
            }));
            setFile(null); // Сброс состояния файла в случае ошибки
        } else {
            setError(prevState => ({
                ...prevState,
                file: ''
            }));
            setFile(selectedFile); // Устанавливаем файл, если он валиден
        }
    };

    // Функция для обработки создания проекта
    const onCreate = async () => {
        if (!validateInputs()) return;

        setLoading(true);

        try {
            await handleProjectCreate(file); // Передаем файл в функцию создания проекта
            window.location.reload();
            toast.success('Проект успешно создан!');
            onClose();
        } catch (err) {
            console.error('Ошибка создания проекта:', err);
            toast.error(`Ошибка при создании проекта: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>Добавить новый проект</Typography>

                <FormControl fullWidth margin="normal" error={Boolean(error.title)}>
                    <TextField
                        label="Название проекта"
                        name="title"
                        value={newProject.title || ''}
                        onChange={handleInputChange}
                        error={Boolean(error.title)}
                        helperText={error.title}
                    />
                </FormControl>

                <FormControl fullWidth error={Boolean(error.file)} sx={{ marginTop: '10px' }}>
                    <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        accept=".docx" // Ограничиваем выбор файлов только до .docx
                        aria-label="Загрузите файл проекта"
                    />
                    <FormHelperText>{error.file}</FormHelperText>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        onClick={onCreate}
                        disabled={loading}
                        sx={{ marginBottom: '10px' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                    >
                        Отмена
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default CreateProjectModal;
