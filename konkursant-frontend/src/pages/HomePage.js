// src/pages/HomePage.js

import React from 'react';
import { Button, Container, Typography } from '@mui/material';
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

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Добро пожаловать в Конкурсант.Гранты!
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleLogin} 
        style={{ margin: '10px' }}
      >
        Войти
      </Button>
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={handleRegister} 
        style={{ margin: '10px' }}
      >
        Регистрация
      </Button>
    </Container>
  );
};

export default HomePage;
