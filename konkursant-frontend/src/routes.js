// src/routes.js

// Импортируем необходимые библиотеки и компоненты
import React from 'react';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';
import NotFound from './pages/NotFound';
import Instructions from './pages/Instructions';
import AccessDenied from './pages/AccessDenied';

import ProjectDetail from './components/ProjectDetails';

// Определяем массив маршрутов
const routes = [
  { path: '/', element: <HomePage /> }, // Главная страница
  { path: '/login', element: <Login /> }, // Страница входа
  { path: '/register', element: <Register /> }, // Страница регистрации
  { path: '/workspace', element: <Workspace /> }, // Рабочее пространство
  { path: '/project/:id', element: <ProjectDetail /> }, // Добавленный маршрут
  { path: '/instructions', element: <Instructions /> }, // Страница инструкций
  { path: '/access-denied', element: <AccessDenied /> }, // Страница для Нет доступа
  { path: '*', element: <NotFound /> }, // Страница 404 для всех остальных маршрутов
];

// Экспортируем маршруты для использования в App
export default routes;
