// src/pages/NotFound.js

import React from 'react';
import { Typography, Container } from '@mui/material';

const NotFound = () => {
  return (
    <Container sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h4">404</Typography>
      <Typography variant="h6">Страница не найдена</Typography>
    </Container>
  );
};

export default NotFound;
