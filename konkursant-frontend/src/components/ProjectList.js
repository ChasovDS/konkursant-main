import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, CircularProgress } from '@mui/material';
import ProjectCard from './ProjectCard';
import { fetchVerifiedProjects } from '../services/reviewService';

// Тексты перевода критериев
const criteriaTranslations = {
    team_experience: 'Опыт и компетенции команды проекта',
    project_relevance: 'Актуальность и социальная значимость проекта',
    solution_uniqueness: 'Уникальность и адресность предложенного решения проблемы',
    implementation_scale: 'Логическая связанность и реализуемость проекта',
    development_potential: 'Перспектива развития и потенциал проекта',
    project_transparency: 'Информационная открытость проекта',
    feasibility_and_effectiveness: 'Реализуемость проекта и его результативность',
    planned_expenses: 'Планируемые расходы на реализацию проекта',
    budget_realism: 'Реалистичность бюджета проекта'
};

// Компонент для отображения результатов проверок проектов
const ProjectReviews = ({ selectedTab, user }) => {
    const [reviewedProjects, setReviewedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsData = await fetchVerifiedProjects();

                const projects = projectsData.reduce((acc, review) => {
                    const { project_id } = review;
                    if (!acc[project_id]) {
                        acc[project_id] = {
                            project_id,
                            reviews: [],
                        };
                    }
                    acc[project_id].reviews.push(review);
                    return acc;
                }, {});

                setReviewedProjects(Object.values(projects));
            } catch (err) {
                const errorMessage = err.response?.data?.detail || err.message || "Неизвестная ошибка";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (selectedTab === 1 && (user.role === 'admin' || user.role === 'reviewer')) {
            fetchProjects();
        }
    }, [selectedTab, user.role]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Ошибка при загрузке данных: {String(error)}</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Результаты проверок проектов
            </Typography>
            {reviewedProjects.map(project => {
                console.log('Project:', project);
                const reviews = project.reviews;

                // Вычисляем средние оценки всех экспертов
                const sumOfAverages = reviews.reduce((total, review) => {
                    const scores = Object.keys(criteriaTranslations).map(key => review[key]);
                    const sum = scores.reduce((a, b) => a + b, 0);
                    const average = sum / scores.length;
                    return total + average;
                }, 0).toFixed(2);

                return (
                    <Box key={project.project_id} sx={{ marginBottom: 2, border: '1px solid #ccc', padding: 2, borderRadius: 1 }}>
                        <Typography variant="h6">Проект: {reviews[0]?.project_title}</Typography>
                        <Typography variant="h6">
                            Автор:  {reviews[0]?.author_name}
                        </Typography>

                        {reviews.length > 0 && (
                            <>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ border: '1px solid #ccc', padding: '8px', fontSize: '12px' }}>Эксперт</th>
                                            {Object.keys(criteriaTranslations).map((key) => (
                                                <th key={key} style={{ border: '1px solid #ccc', padding: '8px', fontSize: '12px' }}>
                                                    {criteriaTranslations[key]}
                                                </th>
                                            ))}
                                            <th style={{ border: '1px solid #ccc', padding: '8px', fontSize: '12px' }}>Сумма оценок</th>
                                            <th style={{ border: '1px solid #ccc', padding: '8px', fontSize: '12px' }}>Средняя оценка</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((review, index) => {
                                            const scores = Object.keys(criteriaTranslations).map(key => review[key]);
                                            const sum = scores.reduce((a, b) => a + b, 0);
                                            const average = (sum / scores.length).toFixed(2);

                                            return (
                                                <tr key={index}>
                                                    <td style={{ border: '1px solid #ccc', padding: '8px', minWidth: '70px' }}>Эксперт {review.reviewer_id}</td>
                                                    {scores.map((score, i) => (
                                                        <td key={i} style={{ border: '1px solid #ccc', padding: '8px' }}>{score}</td>
                                                    ))}
                                                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{sum}</td>
                                                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{average}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <Typography variant="body1" sx={{ marginTop: 2 }}>
                                    Сумма средних оценок всех экспертов: {sumOfAverages}
                                </Typography>
                            </>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// Компонент для отображения вкладок с проектами и результатами проверок
const ProjectTabs = ({ user, projects: initialProjects, openProjectDetails, deleteProject, handleModalOpen }) => {
    const [projects, setProjects] = useState(initialProjects);
    const [filters, setFilters] = useState({ title: '', region: '', status: '' });
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const filteredProjects = projects.filter((project) =>
        project.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        (!filters.region || project.region.toLowerCase().includes(filters.region.toLowerCase())) &&
        (!filters.status || project.status.toLowerCase().includes(filters.status.toLowerCase()))
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="project tabs">
                <Tab label="Проекты" />
                {(user.role === 'admin' || user.role === 'reviewer') && <Tab label="Результаты проверок" />}
            </Tabs>

            {selectedTab === 0 && (
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                            <TextField 
                                label="Поиск по названию" 
                                name="title" 
                                value={filters.title} 
                                onChange={handleFilterChange} 
                                sx={{ marginBottom: { xs: 2, md: 0 } }} 
                            />
                            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                                <InputLabel id="status-label">Статус</InputLabel>
                                <Select
                                    labelId="status-label"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    label="Статус"
                                >
                                    <MenuItem value="">
                                        <em>Все</em>
                                    </MenuItem>
                                    <MenuItem value="Ожидает проверки">Ожидает проверки</MenuItem>
                                    <MenuItem value="Оценено">Оценено</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Button variant="contained" onClick={handleModalOpen}>
                            Добавить проект
                        </Button>
                    </Box>
                    <hr />
                    <Grid container spacing={2}>
                        {filteredProjects.length === 0 ? (
                            <Typography sx={{ padding: 2 }}>Проектов нет</Typography>
                        ) : (
                            filteredProjects.map(project => (
                                <Grid item xs={12} sm={6} md={4} key={project.id_project}>
                                    <ProjectCard 
                                        user={user}
                                        project={project} 
                                        openProjectDetails={openProjectDetails}
                                        deleteProject={deleteProject}
                                        updateProjects={setProjects}
                                    />
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>
            )}

            {selectedTab === 1 && (user.role === 'admin' || user.role === 'reviewer') && (
                <ProjectReviews selectedTab={selectedTab} user={user} />
            )}
        </Box>
    );
};

export default ProjectTabs;
