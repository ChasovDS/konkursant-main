// src/services/authService.js



import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8000/auth'; // ваш API

// Создаем экземпляр axios с конфигурацией
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Включаем куки для каждого запроса
});

// Функция регистрации пользователя
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Ошибка при регистрации');
  }
};

// Функция входа пользователя
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', {
      grant_type: 'password',
      username: email,
      password: password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Ошибка при входе');
  }
};

// Функция получения данных текущего пользователя
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/me/');
    return response.data;
  } catch (error) {
    throw new Error('Не удалось получить текущего пользователя');
  }
};

export const logout = async () => {
  try {
      const response = await axiosInstance.post('/logout', {}, {
          headers: {
              'Authorization': `Bearer ${Cookies.get('access_token')}`,
          },
      });

      if (response.status === 200) {
          // Удаляем куки с токеном
          Cookies.remove('access_token');
          console.log('Вы вышли успешно');
          return true; // Возвращаем true при успешном выходе
      } else {
          console.error('Ошибка выхода:', response.data);
          return false; // Возвращаем false если есть ошибка
      }
  } catch (error) {
      console.error('Ошибка при попытке выйти:', error);
      return false; // Возвращаем false при ошибке
  }
};