// src/components/LoadingScreen.js

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f0f0f0', // Светлый фон
                color: '#333',
            }}
        >
            <CircularProgress />
            <Typography variant="h6" sx={{ marginTop: 2 }}>
                Загрузка...
            </Typography>
        </Box>
    );
};

export default LoadingScreen;
