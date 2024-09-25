import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

import axios from 'axios';
import { getProjectDetails, updateFileLinks } from '../services/projectService';
import { getProjectReviews } from '../services/reviewService';

import { Typography, Divider, Grid, Card, CardContent, Tabs, Tab, TextField, Breadcrumbs, Button, Slider } from '@mui/material';

const API_URL = 'http://localhost:8000/reviews';

const ProjectDetail = ({onBack, user }) => {
    const { id } = useParams();
    const [selectedTab, setSelectedTab] = useState(0);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({});
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState();

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            try {
                const projectData = await getProjectDetails(id);
                const reviewsData = await getProjectReviews(id);
                const combinedData = {
                    ...projectData,
                    reviews: reviewsData || [],
                };
                setProject(combinedData);
                setFiles(combinedData["Вкладка Доп. Файлы"]["Файлы"] || []);
            } catch (err) {
                setError(`Ошибка: ${err.message || 'при загрузке данных о проекте.'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id]);

    if (loading) return <Typography variant="h6">Загрузка...</Typography>;
    if (error) return <Typography variant="h6">{error}</Typography>;
    if (!project) return <Typography variant="h6">Проект не найден.</Typography>;

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    
    // Компоненты для рендеринга, обработчиков и вспомогательных функций
    const renderReadOnlyTextField = (label, value) => (
        <TextField
            label={label}
            value={value}
            InputProps={{ readOnly: true }}
            variant="outlined"
            fullWidth
            margin="normal"
        />
    );



    // Заглушка для функции изменения поля ссылки файла
    const handleFileLinkChange = (index, value) => {
        const updatedFiles = [...files];
        updatedFiles[index]["Ссылка на файл:"] = value;
        setFiles(updatedFiles);
    };


    
    // Функция для сохранения изменений
    const handleSaveChanges = async () => {
        const file_ids = files.map(file => file["ID файла"]);
        const file_links = files.map(file => file["Ссылка на файл:"]);

        try {
            const response = await updateFileLinks(id, file_ids, file_links);
            console.log('Ответ сервера:', response);
            alert('Ссылки на файлы успешно добавлены!');
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Не удалось сохранить изменения. Попробуйте еще раз.');
        }
    };
    
    const renderReadOnlyTextFieldMultiline = (label, value) => (
        <TextField
            label={label}
            value={value || ''} // Добавляем значение по умолчанию в случае пустого значения
            multiline={true} // Указываем, что это многострочное поле
            InputProps={{
                readOnly: true, // Поле только для чтения
            }}
            variant="outlined"
            fullWidth
            margin="normal"
            rows={4} // Устанавливаем количество видимых строк. Можете изменить по необходимости.
        />
    );
    

    const handleSliderChange = (criteria, value) => {
        setRatings({
            ...ratings,
            [criteria]: value,
        });
    };
    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const renderListField = (label, items) => {
        return (
            <div style={{ marginBottom: '8px' }}>
                <Typography variant="body1" fontWeight="bold">{label}:</Typography>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>
                            <Typography variant="body2">{item}</Typography>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleSubmit = async () => {
        // Prepare the data to send
        const reviewData = {
            project_id: id, // Используйте id, переданный в компонент
            team_experience: ratings.team_experience || 0,
            project_relevance: ratings.project_relevance || 0,
            solution_uniqueness: ratings.solution_uniqueness || 0,
            implementation_scale: ratings.implementation_scale || 0,
            development_potential: ratings.development_potential || 0,
            project_transparency: ratings.project_transparency || 0,
            feasibility_and_effectiveness: ratings.feasibility_and_effectiveness || 0,
            additional_resources: ratings.additional_resources || 0,
            planned_expenses: ratings.planned_expenses || 0,
            budget_realism: ratings.budget_realism || 0,
            feedback: feedback || '',
            status: 'Оценено' // Статус можно установить на сервере, если он не нужен на фронтенде
        };
    
        try {
            const response = await axios.post(`${API_URL}/create_review/${id}`, reviewData, {
                withCredentials: true, // Отправляем куки с запросом
            });
            
            console.log('Отзыв успешно отправлен:', response.data);
            setSubmitted(true);
    
            // Здесь можно добавить дополнительную логику, если нужно, например, перезагрузить оценки
        } catch (error) {
            console.error('Ошибка:', error.response ? error.response.data.detail : error.message);
            
            if (error.response) {
                // Обработка разных ошибок
                if (error.response.status === 400) {
                    // Ошибка 400, например, если отзыв уже оставлен
                    alert('Вы уже оставили отзыв для этого проекта.');
                } else if (error.response.status === 403) {
                    alert('У вас нет прав для оценки этого проекта.');
                } else if (error.response.status === 404) {
                    alert('Проект не найден.');
                } else {
                    alert('Произошла ошибка. Попробуйте еще раз.');
                }
            } else {
                alert('Сеть недоступна или сервер не отвечает.');
            }
            
            setSubmitted(false);
        }
    };
    


    const criteriaTranslations = {
        team_experience: 'Опыт и компетенции команды проекта',
        project_relevance: 'Актуальность и социальная значимость проекта',
        solution_uniqueness: 'Уникальность предложенного решения проблемы',
        implementation_scale: 'Масштаб реализации проекта',
        development_potential: 'Перспектива развития и потенциал проекта',
        project_transparency: 'Информационная открытость проекта',
        feasibility_and_effectiveness: 'Реализуемость проекта и его результативность',
        additional_resources: 'Собственный вклад и дополнительные ресурсы проекта',
        planned_expenses: 'Планируемые расходы на реализацию проекта',
        budget_realism: 'Реалистичность бюджета проекта'
    };
    
    const renderRatingForm = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6" pb={2} >Оценка проекта:</Typography>
                <Grid container spacing={2}>
                    {Object.keys(criteriaTranslations).map((criteria) => (
                        <Grid item xs={12} sm={4} key={criteria}>
                            <Typography>{criteriaTranslations[criteria]}</Typography>
                            <Grid container alignItems="center">
                                <Grid item xs>
                                    <Slider
                                        value={ratings[criteria] || 0}
                                        onChange={(event, value) => handleSliderChange(criteria, value)}
                                        min={1}
                                        max={10}
                                        valueLabelDisplay="auto"
                                    />
                                </Grid>
                                <Grid item>
                                    <Typography variant="h6" padding={1}>{ratings[criteria] || 0}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
                <TextField
                    label="Комментарий эксперта"
                    value={feedback}
                    onChange={handleFeedbackChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Завершить оценивание проекта
                </Button>
                {submitted && <Typography color="success.main">Оценка успешно отправлена!</Typography>}
            </CardContent>
        </Card>
    );
    


    const renderCommonInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6">Общая информация:</Typography>
                <Grid container spacing={2}>
                    {/* Первая строка */}
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("ФИО", project["ФИО"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Масштаб реализации проекта", project["Вкладка Общее"]["Блок Общая информация"]["Масштаб реализации проекта"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Даты", project["Вкладка Общее"]["Блок Общая информация"]["Дата начала и окончания проекта"].join(' - '))}
                    </Grid>
                    
                    {/* Вторая строка */}
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Телефон", project["Контакты"]["Телефон"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Email", project["Контакты"]["Email"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Регион проекта", project["Регион проекта"])}
                    </Grid>
                </Grid>

                <Typography variant="h6" style={{ marginTop: '16px' }}>Дополнительная информация:</Typography>
                {renderListField("Опыт автора проекта", project["Вкладка Общее"]["Блок Дополнительная информация об авторе проекта"]["Опыт автора проекта"])}
                {renderListField("Описание функционала автора проекта", project["Вкладка Общее"]["Блок Дополнительная информация об авторе проекта"]["Описание функционала автора проекта"])}
                {renderReadOnlyTextField("Адрес регистрации автора проекта", project["Вкладка Общее"]["Блок Дополнительная информация об авторе проекта"]["Адрес регистрации автора проекта"].join(', '))}
                {renderReadOnlyTextField("Видео-визитка", project["Вкладка Общее"]["Блок Дополнительная информация об авторе проекта"]["Видео-визитка"])}
            </CardContent>
        </Card>
    );


    const renderProjectInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
        <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
                Информация о проекте
            </Typography>
            {renderListField("Краткая информация", project["Вкладка О проекте"]["Блок Информация о проекте"]["Краткая информация о проекте"])}
            {renderListField("Описание проблемы", project["Вкладка О проекте"]["Блок Информация о проекте"]["Описание проблемы"])}
            {renderListField("Целевые группы", project["Вкладка О проекте"]["Блок Информация о проекте"]["Основные целевые группы"])}
            {renderListField("Основная цель", project["Вкладка О проекте"]["Блок Информация о проекте"]["Основная цель проекта"])}
            {renderListField("Опыт успешной реализации", project["Вкладка О проекте"]["Блок Информация о проекте"]["Опыт успешной реализации проекта"])}
            {renderListField("Перспектива развития", project["Вкладка О проекте"]["Блок Информация о проекте"]["Перспектива развития и потенциал проекта"])}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
                География проекта
            </Typography>
            <Grid container spacing={2}>
                {project["Вкладка О проекте"]["Блок География проекта"].map((geo, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ height: '100%', p: 1 }}>
                            {renderReadOnlyTextField("Регион", geo["Регион"])}
                            {renderReadOnlyTextField("Адрес", geo["Адрес"])}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </CardContent>
    </Card>
    );

    const renderTeamInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Команда проекта:
                </Typography>
                {project["Вкладка Команда"]["Блок Команда"]["Наставники"].map((mentor, index) => (
                    <div key={index}>
                        <Typography variant="h6" style={{ marginTop: '10px' }}>
                            Наставник:
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("ФИО", mentor["ФИО"])}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("E-mail", mentor["E-mail"])}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("Роль", mentor["Роль в проекте"])}
                            </Grid>
                        </Grid>
                        {renderReadOnlyTextFieldMultiline("Компетенции", mentor["Компетенции"])}
                        <Divider style={{ margin: '10px 0' }} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    const renderResultsInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6">Результаты:</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Дата плановых значений", project["Вкладка Результаты"]["Вкладка Результаты"]["Дата плановых значений результатов"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Плановое количество мероприятий", project["Вкладка Результаты"]["Вкладка Результаты"]["Плановое количество мероприятий"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Крайняя дата проведения мероприятий", project["Вкладка Результаты"]["Вкладка Результаты"]["Крайняя дата проведения мероприятий"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Плановое количество участников", project["Вкладка Результаты"]["Вкладка Результаты"]["Плановое количество участников мероприятий"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Плановое количество публикаций", project["Вкладка Результаты"]["Вкладка Результаты"]["Плановое количество публикаций"])}
                    </Grid>
                    <Grid item xs={4}>
                        {renderReadOnlyTextField("Плановое количество просмотров публикаций", project["Вкладка Результаты"]["Вкладка Результаты"]["Плановое количество просмотров публикаций"])}
                    </Grid>
                </Grid>
                    {renderListField("Социальный эффект", project["Вкладка Результаты"]["Вкладка Результаты"]["Социальный эффект"])}
            </CardContent>
        </Card>
    );

    const renderScheduleInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6">Календарный план:</Typography>
                {project["Вкладка Календарный план"]["Блок Задачи"].map((task, index) => (
                    <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                        <Typography variant="h6">Поставленная задача: {task["Поставленная задача"]}</Typography>
                        <Grid container spacing={2}>
                            {task["Мероприятия"].map((event, subIndex) => (
                                <Grid item xs={12} sm={6} md={4} key={subIndex}>
                                    <div style={{ padding: '10px', border: '1px solid #e0e0e0', borderRadius: '5px', marginBottom: '10px' }}>
                                        {renderReadOnlyTextField("Название мероприятия", event["Название"])}
                                        {renderReadOnlyTextField("Крайняя дата", event["Крайняя дата"])}
                                        {renderReadOnlyTextField("Уникальные участники", event["Количество уникальных участников"])}
                                        {renderReadOnlyTextField("Повторяющиеся участники", event["Количество повторяющихся участников"])}
                                        {renderReadOnlyTextField("Количество публикаций", event["Количество публикаций"])}
                                        {renderReadOnlyTextField("Количество просмотров", event["Количество просмотров"])}
                                        {renderReadOnlyTextFieldMultiline("Описание", event["Описание"])}
                                        {renderReadOnlyTextFieldMultiline("Доп. информация", event["Дополнительная информация"])}
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                ))}
            </CardContent>

        </Card>
    );

    const renderMediaInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Медиа:</Typography>
                {project["Вкладка Медиа"]["Ресурсы"].map((resource, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("Вид ресурса", resource["Вид ресурса"])}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("Месяц публикации", resource["Месяц публикации"])}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                {renderReadOnlyTextField("Планируемое количество просмотров", resource["Планируемое количество просмотров"])}
                            </Grid>
                            <Grid item xs={12}>
                                {renderReadOnlyTextFieldMultiline("Ссылки", resource["Ссылки на ресурсы"])}
                            </Grid>
                            <Grid item xs={12}>
                                {renderReadOnlyTextFieldMultiline("Почему выбран формат", resource["Почему выбран такой формат медиа"])}
                            </Grid>
                        </Grid>
                        <Divider style={{ margin: '10px 0' }} />
                    </div>
                ))}
                {renderReadOnlyTextField("Файл медиа-плана", project["Вкладка Медиа"]["Файл с подробным медиа-планом"].join(', '))}
            </CardContent>
        </Card>
    );

    const renderCoFinanceInfo = () => (
        <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Софинансирование:</Typography>
                
                {/* Собственные средства */}
                <Typography variant="subtitle1" gutterBottom>Собственные средства:</Typography>
                {
                    // Проверяем, существует ли массив "Расходы" перед вызовом map
                    project["Вкладка Софинансирование"] &&
                    project["Вкладка Софинансирование"]["Блок Собственные средства"] &&
                    project["Вкладка Софинансирование"]["Блок Собственные средства"]["Расходы"] &&
                    project["Вкладка Софинансирование"]["Блок Собственные средства"]["Расходы"].map((expense, index) => (
                        <div key={index}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12}>
                                    {/* Здесь мы отображаем все элементы из Перечень расходов */}
                                    {renderReadOnlyTextFieldMultiline("Перечень расходов", expense["Перечень расходов"].join("\n"))}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {renderReadOnlyTextField(
                                        "Сумма", 
                                        expense["Сумма расходов"] ? expense["Сумма расходов"] : "0"
                                    )}
                                </Grid>
                            </Grid>
                            <Divider style={{ margin: '10px 0' }} />
                        </div>
                    ))
                }
                
                {/* Партнеры */}
                <Typography variant="subtitle1" gutterBottom>Партнеры:</Typography>
                {
                    // Проверяем, существует ли массив "Блок Партнер" перед вызовом map
                    project["Вкладка Софинансирование"] &&
                    project["Вкладка Софинансирование"]["Блок Партнер"] &&
                    project["Вкладка Софинансирование"]["Блок Партнер"].map((partner, index) => (
                        <div key={index}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    {renderReadOnlyTextField("Название партнера", partner["Название партнера"])}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {renderReadOnlyTextField("Тип поддержки", partner["Тип поддержки"])}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {renderReadOnlyTextField("Сумма, руб.", partner["Сумма, руб."])}
                                </Grid>
                                <Grid item xs={12}>
                                    {renderReadOnlyTextFieldMultiline("Перечень расходов", partner["Перечень расходов"])}
                                </Grid>
                            </Grid>
                            <Divider style={{ margin: '10px 0' }} />
                        </div>
                    ))
                }
            </CardContent>
        </Card>
    );
    
    

// Рендеринг дополнительных файлов
const renderAdditionalFiles = () => (
    <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
        <CardContent>
            <Typography variant="h6">Дополнительные файлы:</Typography>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {files.map((file, index) => (
                    <div key={file["ID файла"]} style={{ display: 'flex', flexDirection: 'column' }}>
                        {renderReadOnlyTextField("Описание файла", file["Описание файла"])}
                        {renderReadOnlyTextField("ID файла", file["ID файла"])}
                        <TextField
                            label="Ссылка на файл"
                            value={file["Ссылка на файл:"] || ''} // Обеспечиваем, что значение не будет undefined
                            onChange={(e) => handleFileLinkChange(index, e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <Divider style={{ margin: '10px 0' }} />
                    </div>
                ))}
            </div>
            
            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                Сохранить изменения
            </Button>
        </CardContent>
    </Card>
);



    const renderExpertEvaluation = () => {
        const reviews = project.reviews || []; 

        // Расчет итоговой суммы и среднего значения
        const totalScores = reviews.reduce((acc, review) => {
            for (const key of Object.keys(review)) {
                if (key !== 'project_id' && key !== 'feedback' && key !== 'status') {
                    acc[key] = (acc[key] || 0) + review[key];
                }
            }
            return acc;
        }, {});

        const averageScores = {};
        const expertCount = reviews.length;

        for (const key in totalScores) {
            averageScores[key] = (totalScores[key] / expertCount).toFixed(2);
        }

        return (
            <Card style={{ marginRight: '20px', marginLeft: '20px', width: '100%'}}>
                <CardContent>
                    <Typography variant="h6" style={{padding: '4px'}}> Экспертная оценка проекта:</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px', minWidth: '70px' }}>Эксперт</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Опыт и компетенции команды проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Актуальность и социальная значимость проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Уникальность и адресность предложенного решения проблемы </th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Масштаб реализации проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Перспектива развития и потенциал проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Информационная открытость проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Реализуемость проекта и его результативность</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Собственный вклад и дополнительные ресурсы проекта </th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Планируемые расходы на реализацию проекта для достижения ожидаемых результатов</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Реалистичность бюджета проекта</th>
                                        <th style={{ border: '1px solid #ccc', padding: '8px',  fontSize: '12px' }}>Комментарий эксперта</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>Эксперт {index + 1}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.team_experience}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.project_relevance}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.solution_uniqueness}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.implementation_scale}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.development_potential}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.project_transparency}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.feasibility_and_effectiveness}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.additional_resources}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.planned_expenses}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.budget_realism}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '8px'}}>{review.feedback}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };



    return (
        <div style={{ padding: '20px' }}>
            <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '20px' }}>
                <RouterLink color="inherit" to={'/workspace'} style={{ cursor: 'pointer' }}>
                    Проекты
                </RouterLink>
                <Typography color="text.primary" variant="h5">{project["Название проекта"]}</Typography>
            </Breadcrumbs>

            <Divider style={{ margin: '20px 0' }} />
    
            <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                <Tab label="Общая информация" />
                <Tab label="О Проекте" />
                <Tab label="Команда" />
                <Tab label="Результаты" />
                <Tab label="Календарный план" />
                <Tab label="Медиа" />
                <Tab label="Софинансирование" />
                <Tab label="Файлы" />
                <Tab label="Экспертная оценка" />
                <Tab label="Оценка проекта" />
            </Tabs>
    
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                {selectedTab === 0 && renderCommonInfo()}
                {selectedTab === 1 && renderProjectInfo()}
                {selectedTab === 2 && renderTeamInfo()}
                {selectedTab === 3 && renderResultsInfo()}
                {selectedTab === 4 && renderScheduleInfo()}
                {selectedTab === 5 && renderMediaInfo()}
                {selectedTab === 6 && renderCoFinanceInfo()}
                {selectedTab === 7 && renderAdditionalFiles()}
                {selectedTab === 8 && renderExpertEvaluation()}
                {selectedTab === 9 && renderRatingForm()}
                
            </Grid>
        </div>
    );
};

export default ProjectDetail;