import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { registerUser } from '../services/authService'; 
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow: theme.shadows[3],
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  backgroundImage:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover', // Чтобы фон занимал всю область
}));



export default function SignUp() {
  const theme = createTheme(); // Используем стандартную тему

  // Состояния для управления полями ввода и сообщениями об ошибках
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess(false);
  };

  const validateInputs = () => {
    let isValid = true;

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Введите действительный адрес электронной почты.');
      isValid = false;
    } else if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      isValid = false;
    } else if (fullName.length < 1) {
      setError('Имя обязательно.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateInputs()) return; // Проверка валидности перед отправкой

    try {
      await registerUser({ email, password, full_name: fullName });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login'; // Перенаправление после успешной регистрации
      }, 2000);
    } catch (err) {
      setError('Ошибка при регистрации. Попробуйте снова.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Stack
          sx={{
            justifyContent: 'center',
            height: '100vh',
            p: 2,
          }}
        >
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              Регистрация
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl>
                <FormLabel htmlFor="name">Полное ФИО</FormLabel>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  placeholder="Иванов Иван Иванович"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="your@email.com"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Пароль</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
              >
                Зарегистрироваться
              </Button>
              <Typography sx={{ textAlign: 'center' }}>
                Уже есть аккаунт?{' '}
                <span>
                  <Link
                    href="/login"
                    variant="body2"
                    sx={{ alignSelf: 'center' }}
                  >
                    Войти
                  </Link>
                </span>
              </Typography>
            </Box>
          </Card>
        </Stack>
      </SignUpContainer>
      
      {/* Snackbar для отображения ошибок и успеха */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={2000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Успешная регистрация! Перенаправление...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
