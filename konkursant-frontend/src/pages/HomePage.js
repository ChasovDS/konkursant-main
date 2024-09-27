// src/pages/HomePage.js

import React from 'react';
import { Button, Container, Typography, Alert, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Компонент главной страницы
const HomePage = () => {
  const navigate = useNavigate();

  // Функция для перехода на страницу входа
  const handleLogin = () => {
    navigate('/login');
  };

  // Функция для перехода на страницу регистрации
  const handleRegister = () => {
    navigate('/register');
  };

  // Функция для перехода на страницу инструкций
  const handleInstructions = () => {
    navigate('/Instructions');
  };

  return (
    <Container maxWidth="md">
      <Box 
        textAlign="center" 
        mt={{ xs: 2, sm: 5 }} 
        p={2} 
        borderRadius={2} 
        bgcolor="background.paper"
      >
        <Typography variant="h4" gutterBottom>
          Добро пожаловать в Конкурсант.Гранты!
        </Typography>

        {/* Уведомление о том, что сайт в разработке */}
        <Alert severity="info" sx={{ my: 3 }}>
          <Box lineHeight={1.5}>
            <Typography variant="body1">
              Сайт находится в разработке и в режиме тестирования.
              Мы вскоре добавим новые функции и улучшения!
            </Typography>
          </Box>
        </Alert>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleLogin}
              sx={{ minWidth: 150 }}
            >
              Войти
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleRegister}
              sx={{ minWidth: 150 }}
            >
              Регистрация
            </Button>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleInstructions}
              sx={{ minWidth: 150 }}
            >
              Инструкция
            </Button>
          </Grid>
        </Grid>

        {/* Пояснение о необходимости использования на ПК */}
        <Box mt={4}>
          <Alert severity="warning">
            <Typography variant="body2" align="center">
              Внимание: данный сервис в данный момент не оптимизирован под мобильные устройства. 
              Рекомендуется использовать на ПК для лучшего опыта.
            </Typography>
          </Alert>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
