import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  TextField,
  InputAdornment,
} from '@mui/material';
import { AccountCircle, ArrowDropDown, EventNote, Logout as LogoutIcon, Search, DarkMode, LightMode } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';

const { accent, dark, cardBg, cardShadow } = theme;

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);

  // Clear search when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/events')) {
      setSearchQuery('');
    }
  }, [location.pathname]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: theme.navbarFooterBg, boxShadow: cardShadow, borderRadius: '0 0 24px 24px', mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
          <Typography
            className="logo"
            variant="h4"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: accent,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            Eventy
          </Typography>

          <Box sx={{ flex: 1, mx: 4, maxWidth: 600 }}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search events by name, description, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: accent }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: accent,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: accent,
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    px: 2,
                    fontSize: '1rem',
                    color: dark,
                    '&::placeholder': {
                      color: '#666',
                      opacity: 0.8,
                    },
                  },
                }}
              />
            </form>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: accent,
                background: '#f3eaff',
                borderRadius: '999px',
                p: 1,
                '&:hover': { background: '#e9d6fa' },
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <EventyButton component={RouterLink} to="/admin">Admin Panel</EventyButton>
                )}
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    color: accent,
                    background: '#f3eaff',
                    borderRadius: '999px',
                    p: 1,
                    '&:hover': { background: '#e9d6fa' },
                  }}
                >
                  <AccountCircle fontSize="large" />
                  {user && (
                    <Typography component="span" sx={{ ml: 1, fontWeight: 400, color: '#222', fontFamily: 'Lato, Arial, sans-serif', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                      {user.name}
                    </Typography>
                  )}
                  <ArrowDropDown fontSize="large" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  autoFocusItem={false}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 3,
                      boxShadow: cardShadow,
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--background-secondary)',
                      p: 1,
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      p: 0,
                    },
                  }}
                >
                  <MenuItem component={RouterLink} to="/profile" onClick={handleClose} autoFocus={false} sx={{
                    borderRadius: 2,
                    mb: 1,
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 400,
                    fontFamily: 'Lato, Arial, sans-serif',
                    color: 'var(--text-primary)',
                    '&:hover, &:focus-visible': {
                      background: 'var(--background-primary)',
                      color: accent,
                      '.MuiListItemIcon-root': { color: accent },
                    },
                    '&.Mui-focusVisible:not(:hover)': {
                      background: 'var(--background-primary)',
                      color: accent,
                      '.MuiListItemIcon-root': { color: accent },
                    },
                  }}>
                    <ListItemIcon sx={{ color: accent }}>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    View My Profile
                  </MenuItem>
                  {!isAdmin && (
                    <MenuItem component={RouterLink} to="/booked-events" onClick={handleClose} autoFocus={false} sx={{
                      borderRadius: 2,
                      mb: 1,
                      px: 2.5,
                      py: 1.2,
                      fontWeight: 400,
                      fontFamily: 'Lato, Arial, sans-serif',
                      color: 'var(--text-primary)',
                      '&:hover, &:focus-visible': {
                        background: 'var(--background-primary)',
                        color: accent,
                        '.MuiListItemIcon-root': { color: accent },
                      },
                      '&.Mui-focusVisible:not(:hover)': {
                        background: 'var(--background-primary)',
                        color: accent,
                        '.MuiListItemIcon-root': { color: accent },
                      },
                    }}>
                      <ListItemIcon sx={{ color: accent }}>
                        <EventNote fontSize="small" />
                      </ListItemIcon>
                      My Bookings
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} autoFocus={false} sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 400,
                    fontFamily: 'Lato, Arial, sans-serif',
                    color: 'error.main',
                    '&:hover, &:focus-visible': {
                      background: 'var(--background-primary)',
                      color: 'error.main',
                      '.MuiListItemIcon-root': { color: 'error.main' },
                    },
                    '&.Mui-focusVisible:not(:hover)': {
                      background: 'var(--background-primary)',
                      color: 'error.main',
                      '.MuiListItemIcon-root': { color: 'error.main' },
                    },
                  }}>
                    <ListItemIcon sx={{ color: 'error.main' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <EventyButton component={RouterLink} to="/login">Login</EventyButton>
                <EventyButton component={RouterLink} to="/register">Register</EventyButton>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 