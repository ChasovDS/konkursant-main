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


  // Функция для перехода на страницу регистрации
  const handleInstructions = () => {
    navigate('/Instructions');
  };

  return (
    <Container maxWidth="sm">
      <Box 
        textAlign="center" 
        mt={5} 
        p={2} 
        borderRadius={2} 
        bgcolor="background.paper"
      >
        <Typography variant="h4" gutterBottom>
          Добро пожаловать в Конкурсант.Гранты!
        </Typography>

        {/* Уведомление о том, что сайт в разработке */}
        <Alert severity="info" style={{ marginBottom: '20px' }}>
          <Box lineHeight={1.5}>
            <Typography variant="body1">
              Сайт находится в разработке и в режиме тестирования.
            </Typography>
            <Typography variant="body1">
              Мы вскоре добавим новые функции и улучшения!
            </Typography>
          </Box>
        </Alert>

        <Grid container spacing={3} justifyContent="center" style={{ marginBottom: '20px' }}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
            >
              Войти
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRegister}
            >
              Регистрация
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={3} justifyContent="center" >
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleInstructions}
            >
              Инструкция
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
