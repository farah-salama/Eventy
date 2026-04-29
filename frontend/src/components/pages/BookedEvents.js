import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';
import { CalendarToday, LocationOn } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const { accent, dark, cardBg, cardShadow, gradientBg } = theme;

// Helper to format date as dd/mm/yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper to get full image URL
const getImageUrl = (img) => img?.startsWith('/uploads/') ? `${API_URL}${img}` : img;

const BookedEvents = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/bookings`);
        setBookings(res.data);
      } catch (error) {
        setError('Error fetching bookings');
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      if (isAdmin) {
        navigate('/events');
        return;
      }
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, navigate, isAdmin]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`);
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        ));
      } catch (error) {
        setError('Error cancelling booking');
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/event/${eventId}`);
  };

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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
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
      <Container
        maxWidth="md"
        sx={{
          background: cardBg,
          borderRadius: '32px',
          boxShadow: cardShadow,
          px: { xs: 2, sm: 6 },
          py: { xs: 3, sm: 6 },
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" align="center" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 4 }}>
          My Booked Events
        </Typography>
        {bookings.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 4, color: 'var(--text-secondary)' }}>
            You haven't booked any events yet.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {bookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: cardBg,
                    borderRadius: '24px',
                    boxShadow: cardShadow,
                    p: 2,
                    mb: 2,
                    border: 'none',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={getImageUrl(booking.event.image) || 'https://via.placeholder.com/120x120'}
                    alt={booking.event.name}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '16px',
                      objectFit: 'cover',
                      mr: 3,
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 0 }}>
                    <Typography variant="h6" sx={{ color: accent, fontWeight: 700, mb: 1, fontSize: '1.2rem', cursor: 'pointer', textDecoration: 'none' }} onClick={() => handleViewEvent(booking.event._id)}>
                      {booking.event.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2, flexWrap: 'wrap' }}>
                      <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ color: accent, fontSize: '1.2rem' }} /> {formatDate(booking.event.date)}
                      </Typography>
                      <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ color: accent, fontSize: '1.2rem' }} /> {booking.event.venue}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={booking.status}
                        sx={{
                          background: booking.status === 'confirmed' ? accent : '#ff7675',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: '999px',
                          px: 3,
                          py: 1,
                          fontSize: '1rem',
                          textTransform: 'capitalize',
                        }}
                      />
                      <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Booked on: {formatDate(booking.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <EventyButton onClick={() => handleViewEvent(booking.event._id)}>View Event</EventyButton>
                      {booking.status === 'confirmed' && (
                        <EventyButton
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={new Date(booking.event.date) < new Date()}
                          sx={{ background: accent, '&:hover': { background: dark }, opacity: new Date(booking.event.date) < new Date() ? 0.7 : 1, cursor: new Date(booking.event.date) < new Date() ? 'not-allowed' : 'pointer' }}
                        >
                          Cancel
                        </EventyButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default BookedEvents; 