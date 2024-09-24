import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Modal, CircularProgress, FormControl, FormHelperText
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateProjectModal = ({
    open, onClose, newProject, handleInputChange,
    handleFileChange, handleProjectCreate
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        title: '',
        file: ''
    });

    // Вспомогательная функция для проверки наличия ошибок
    const validateInputs = () => {
        const errors = {};

        if (!newProject.title) {
            errors.title = 'Пожалуйста, введите название проекта.';
        }
        if (!newProject.file) {
            errors.file = 'Пожалуйста, загрузите файл проекта.';
        }

        setError(errors);

        return Object.keys(errors).length === 0;
    };

    // Функция для обработки создания проекта
    const onCreate = async () => {
        if (!validateInputs()) return;

        setLoading(true);

        try {
            await handleProjectCreate();
            window.location.reload()
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
