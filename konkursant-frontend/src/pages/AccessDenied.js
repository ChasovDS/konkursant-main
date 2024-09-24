import React from 'react';
import { Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/'); // Переход на главную страницу
    };

    return (
        <Container sx={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h4">403</Typography>
            <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                Доступ запрещен
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '30px' }}>
                У вас нет прав доступа к этой странице.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoHome}>
                На главную
            </Button>
        </Container>
    );
};

export default AccessDenied;
