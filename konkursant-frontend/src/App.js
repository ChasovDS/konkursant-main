// src/App.js

import React from 'react'; // Импортируем React
import { ThemeProvider } from '@mui/material/styles'; // Импортируем ThemeProvider
import theme from './theme'; // Импортируем тему
import { Routes, Route } from 'react-router-dom'; // Импортируем маршрутизацию
import routes from './routes'; // Импортируем маршруты

// Компонент App
const App = () => {
  return (
    <ThemeProvider theme={theme}> {/* Оборачиваем все в ThemeProvider */}
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} /> // Отображаем маршруты из массива
        ))}
      </Routes>
    </ThemeProvider>
  );
};

export default App; // Экспортируем компонент App
