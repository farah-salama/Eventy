import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import theme from '../theme';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { cardBg, cardShadow, gradientBg, accent } = theme;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper to format date as dd/mm/yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to load user info.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUser();
    }
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: gradientBg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.gradientBg,
        py: 6,
        px: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            background: cardBg,
            borderRadius: '32px',
            boxShadow: cardShadow,
            px: { xs: 2, sm: 6 },
            py: { xs: 3, sm: 6 },
            mb: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 2 }}>
            My Profile
          </Typography>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : user ? (
            <>
              <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                {user.name}
              </Typography>
              <Typography sx={{ color: 'var(--text-secondary)', mb: 1 }}>{user.email}</Typography>
              <Typography sx={{ color: 'var(--text-secondary)' }}>
                Joined: {user.createdAt ? formatDate(user.createdAt) : ''}
              </Typography>
            </>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile; 