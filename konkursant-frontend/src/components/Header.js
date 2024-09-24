import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate(); // Используем хук для навигации

    const handleLogout = async () => {
        const result = await onLogout();
        if (result) {
            navigate('/'); // Переход на главную страницу после выхода
        } else {
            navigate('/access-denied'); // Переход на страницу "У вас нет доступа"
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Конкурсант.Гранты
                </Typography>
                {user && (
                    <Box display="flex" alignItems="center">
                        <Typography variant="body1" sx={{ marginRight: '10px' }}>
                            {`${user.full_name} (${user.role})`}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: '10px' }}>
                            {user.email}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>Выход</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
