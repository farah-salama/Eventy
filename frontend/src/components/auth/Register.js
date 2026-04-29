import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Link,
  Box,
  Paper,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';

const { accent, cardBg, cardShadow, gradientBg } = theme;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { register, user } = useAuth();

  const validateName = (name) => {
    return name.length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ name: '', email: '', password: '' });

    // Validate name
    if (!validateName(formData.name)) {
      setFieldErrors(prev => ({ ...prev, name: 'Name must be at least 2 characters long' }));
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        password: 'Password must be at least 6 characters long and contain at least one letter and one number' 
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
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
            Register
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              sx={{ background: '#f6f6fa', borderRadius: 2 }}
            />
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
              sx={{ background: '#f6f6fa', borderRadius: 2 }}
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
              sx={{ background: '#f6f6fa', borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ background: '#f6f6fa', borderRadius: 2 }}
            />
            <EventyButton type="submit" fullWidth sx={{ mt: 3 }}>Register</EventyButton>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: accent, fontWeight: 700 }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 