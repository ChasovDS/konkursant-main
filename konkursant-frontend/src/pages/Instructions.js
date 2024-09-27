// src/pages/Instructions.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Typography, Tabs, Tab, Box, Paper, Container } from '@mui/material';

const Instructions = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Инструкция по работе на портале «Конкурсанты Грантов» Росмолодёжи
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper style={{ marginTop: 20 }}>
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Инструкция для Конкурсантов" />
          <Tab label="Инструкция для Экспертов" />
        </Tabs>
      </Paper>
      <Box p={3}>
        {selectedTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Инструкция для пользователей (Конкурсанты)
            </Typography>
            <Typography variant="h6">Регистрация и Авторизация</Typography>
            <ol>
              <li>
                <strong>Перейдите к регистрации:</strong>
                <ul>
                  <li>Заполните поля с вашим полным именем, электронной почтой и паролем.</li>
                  <li>Либо авторизуйтесь, если уже зарегистрированы.</li>
                </ul>
              </li>
            </ol>

            <Typography variant="h6">Создание и добавление проекта</Typography>
            <ol>
              <li>
                <strong>Сохранение проекта:</strong>
                <ul>
                  <li>После успешного создания и сохранения проекта на портале Росмолодёжь Гранты, скачайте его и сохраните на вашем компьютере.</li>
                </ul>
              </li>
              <li>
                <strong>Переход на главную страницу:</strong>
                <ul>
                  <li>Перейдите на главную страницу портала «Конкурсанты Грантов».</li>
                </ul>
              </li>
              <li>
                <strong>Добавление проекта:</strong>
                <ul>
                  <li>После авторизации вы попадёте на рабочее пространство.</li>
                  <li>Нажмите кнопку «Добавить проект» в правой части экрана.</li>
                  <li>Введите название вашего проекта и загрузите файл с вашего компьютера (важно, чтобы это был файл проекта, скачанный с сайта Росмолодёжь Гранты; другие файлы не подойдут).</li>
                </ul>
              </li>
              <li>
                <strong>Просмотр информации о проекте:</strong>
                <ul>
                  <li>После успешного добавления проекта, нажмите кнопку «Открыть проект».</li>
                  <li>Вы попадёте на страницу с информацией о вашем проекте, где сможете ознакомиться с введёнными данными.</li>
                </ul>
              </li>
            </ol>

            <Typography variant="h6">Внесение дополнительных данных</Typography>
            <ol>
              <li>
                <strong>Ввод дополнительных данных:</strong>
                <ul>
                  <li>Из-за ограничений платформы Росмолодёжь Гранты, вам придётся самостоятельно ввести некоторые данные.</li>
                  <li>Перейдите на вкладку «Файлы» и в соответствующие поля добавьте ссылки на файлы, хранящиеся в облачных дисках (например, Яндекс Диск или Google Диск).</li>
                  <li>Нажмите кнопку «Сохранить изменения».</li>
                </ul>
              </li>
              <li>
                <strong>Проверка сохранённых данных:</strong>
                <ul>
                  <li>Обновите страницу, чтобы убедиться, что все данные сохранились.</li>
                </ul>
              </li>
            </ol>

            <Typography variant="h6">Оценка проекта экспертами</Typography>
            <ol>
              <li>
                <strong>Просмотр оценки:</strong>
                <ul>
                  <li>На странице «Экспертная оценка» вы можете увидеть оценки, которые эксперты поставили вашему проекту.</li>
                </ul>
              </li>
            </ol>
          </Box>
        )}
        {selectedTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Инструкция для пользователей (Эксперты)
            </Typography>
            <Typography variant="h6">Авторизация и изучение проектов</Typography>
            <ol>
              <li>
                <strong>Перейдите к авторизации:</strong>
                <ul>
                  <li>Войдите в систему с вашими учетными данными.</li>
                </ul>
              </li>
              <li>
                <strong>Просмотр проектов:</strong>
                <ul>
                  <li>После авторизации вам откроются существующие карточки проектов.</li>
                  <li>Откройте проект, который необходимо изучить.</li>
                </ul>
              </li>
            </ol>

            <Typography variant="h6">Оценка проектов</Typography>
            <ol>
              <li>
                <strong>Оценка проекта:</strong>
                <ul>
                  <li>Перейдите на вкладку «Оценка проекта».</li>
                  <li>Произведите оценку и сохраните изменения.</li>
                </ul>
              </li>
              <li>
                <strong>Просмотр и проверка оценок:</strong>
                <ul>
                  <li>Ваши оценки отобразятся на вкладке «Экспертная оценка».</li>
                  <li>Если данные не отображаются, обновите страницу.</li>
                </ul>
              </li>
            </ol>

            <Typography variant="h6">Важно</Typography>
            <ul>
              <li>Один эксперт может оценить проект только один раз.</li>
            </ul>
          </Box>
        )}
      </Box>
      <footer style={{ marginTop: 20, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => window.history.back()}  style={{ marginBottom: '20px' }}>
          Назад
        </Button>
        <Typography>&copy; 2024 Конкурсант.Гранты</Typography>
      </footer>
    </Container>
  );
};

export default Instructions;
