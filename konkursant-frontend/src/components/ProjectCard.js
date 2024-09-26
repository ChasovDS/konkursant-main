import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    transition: '0.3s',
    '&:hover': {
        boxShadow: theme.shadows[10],
        transform: 'scale(1.02)',
    },
    margin: theme.spacing(0),
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
}));

const ProjectCard = ({ user, project, deleteProject, updateProjects }) => {
    const handleDelete = async () => {
        if (window.confirm("Вы уверены, что хотите удалить этот проект?")) {
            await deleteProject(project.id_project);
            updateProjects(prevProjects => prevProjects.filter(p => p.id_project !== project.id_project));
        }
    };

    return (
        <StyledCard variant="outlined">
            <CardContent>
                <Typography variant="h6" component="div" color="primary" gutterBottom>
                    {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Автор: {project.owner_full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Дата создания: {new Date(project.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" color={project.status === 'Оценено' ? 'green' : 'red'} display="block">
                    Статус: {project.status}
                </Typography>
            </CardContent>
            <StyledCardActions>
               <Link to={`/project/${project.id_project}`} style={{ textDecoration: 'none' }}>
                    <Button size="small" variant="outlined" color="primary">
                        Открыть проект
                    </Button>
                </Link>
                <Button size="small" variant="outlined" color="error" onClick={handleDelete} style={{ marginLeft: '8px' }}>
                    Удалить проект
                </Button>
            </StyledCardActions>
        </StyledCard>
    );
};

export default ProjectCard;
