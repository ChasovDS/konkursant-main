import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Определяем мобильное устройство

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Вы уверены, что хотите выйти?");
        if (confirmLogout) { // Если пользователь подтвердит выход
            const result = await onLogout();
            if (result) {
                navigate('/'); // Переход на главную страницу после выхода
            } 
        } else {
            // Пользователь отменил выход, можно ничего не делать
            console.log("Выход отменён пользователем."); // Лог для отладки
        }
    };
    

        // Функция для перехода на страницу регистрации
    const handleInstructions = () => {
        navigate('/Instructions');
    };

    return (
        <AppBar position="static" sx={{ bgcolor: 'primary.main'}}>
            <Toolbar>
                <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ flexGrow: 1 }}>
                    Конкурсант.Гранты
                </Typography>
                {user && (
                    <Box display="flex" alignItems="center" sx={{ flexDirection: isMobile ? 'column' : 'row' }}>
                        <Typography variant="body1" sx={{ marginRight: '10px', marginBottom: isMobile ? '5px' : '0' }}>
                            {`${user.full_name} (${user.role})`}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: '10px', marginBottom: isMobile ? '5px' : '0' }}>
                            {user.email}
                        </Typography>
                        <Button color="inherit"  onClick={handleInstructions}  >  Инструкция   </Button>
                        <Button color="inherit" onClick={handleLogout} sx={{ marginTop: isMobile ? '5px' : '0' }} style={{ marginLeft: '10px' }} >Выход</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
