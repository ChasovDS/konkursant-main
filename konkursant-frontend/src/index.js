// src/index.js


import React from 'react'; // Импортируем React
import ReactDOM from 'react-dom/client'; // Импортируем метод для рендеринга приложения
import App from './App'; // Импортируем основной компонент приложения
import { BrowserRouter } from 'react-router-dom'; // Импортируем компонент для маршрутизации внутри приложения

// Создаем корень приложения
const rootElement = document.getElementById('root');

// Проверяем, что элемент с ID 'root' существует
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Рендерим приложение внутри компонента BrowserRouter для поддержки маршрутизации
  root.render(
    <React.StrictMode> {/* Включаем строгий режим для выявления потенциальных проблем */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Элемент с ID 'root' не найден."); // Сообщаем об ошибке, если элемент не найден
}
