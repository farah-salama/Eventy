import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';

const { accent, dark, gray, cardBg, cardShadow, gradientBg } = theme;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  // Check for error message in location state
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      // Clear the error from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Only clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });

    // Validate email format
    if (!validateEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    // Validate password is not empty
    if (!formData.password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
      // Keep the form data when there's an error
      setFormData(prev => ({ ...prev }));
    }
  };

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: gradientBg,
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
          }}
        >
          <Typography variant="h4" component="h1" align="center" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 2 }}>
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{
                background: 'var(--background-secondary)',
                borderRadius: 2,
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)',
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: accent,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: accent,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{
                background: 'var(--background-secondary)',
                borderRadius: 2,
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)',
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: accent,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: accent,
                  },
                },
              }}
            />
            <EventyButton type="submit" fullWidth sx={{ mt: 3 }}>Login</EventyButton>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: accent, fontWeight: 700 }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 