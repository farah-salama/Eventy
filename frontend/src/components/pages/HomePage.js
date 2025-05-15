import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';
import { CalendarToday, LocationOn, AttachMoney } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const { accent, dark, gray, cardBg, cardShadow, gradientBg } = theme;

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

const HomePage = () => {
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/top-booked`);
        setTopEvents(res.data);
      } catch (error) {
        setError('Error fetching top events');
        console.error('Error fetching top events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTopEvents();
    }
  }, [authLoading]);

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
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" sx={{ color: 'var(--text-primary)', fontWeight: 900, mb: 2 }}>
            Welcome to Eventy
          </Typography>
          <Typography variant="h5" sx={{ color: 'var(--text-secondary)', mb: 4 }}>
            Discover and book the most popular events in your area
          </Typography>
        </Box>

        <Typography variant="h4" component="h2" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 4 }}>
          Most Popular Events
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Carousel
            animation="slide"
            interval={5000}
            duration={700}
            indicators={true}
            navButtonsAlwaysVisible={true}
            navButtonsProps={{
              style: {
                background: 'rgba(255, 255, 255, 0.8)',
                color: accent,
                borderRadius: '50%',
                boxShadow: cardShadow,
                width: '40px',
                height: '40px',
                '&:hover': {
                  background: accent,
                  color: '#fff',
                },
              },
            }}
            indicatorContainerProps={{
              style: {
                marginTop: '20px',
              },
            }}
            indicatorIconButtonProps={{
              style: {
                color: gray,
                margin: '0 4px',
              },
            }}
            activeIndicatorIconButtonProps={{
              style: {
                color: accent,
              },
            }}
            sx={{
              '& .MuiPaper-root': {
                maxWidth: '100%',
                margin: '0 auto',
              },
            }}
          >
            {topEvents.map((event) => (
              <Box
                key={event._id}
                sx={{
                  position: 'relative',
                  height: '600px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: cardShadow,
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(event.image) || 'https://via.placeholder.com/400x250'}
                  alt={event.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 4,
                  }}
                >
                  <Typography 
                    variant="h3" 
                    component="h3" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 700, 
                      mb: 3,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {event.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    <Typography sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.2rem' }}>
                      <CalendarToday sx={{ color: accent, fontSize: '1.5rem' }} /> {formatDate(event.date)}
                    </Typography>
                    <Typography sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.2rem' }}>
                      <LocationOn sx={{ color: accent, fontSize: '1.5rem' }} /> {event.venue}
                    </Typography>
                    <Typography sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.2rem' }}>
                      <AttachMoney sx={{ color: accent, fontSize: '1.5rem' }} /> {event.price}
                    </Typography>
                  </Box>
                  <EventyButton
                    onClick={() => handleViewEvent(event._id)}
                    sx={{ 
                      width: '100%',
                      py: 1.5,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      background: accent,
                      color: '#fff',
                      '&:hover': {
                        background: dark,
                      },
                    }}
                  >
                    View Details
                  </EventyButton>
                </Box>
              </Box>
            ))}
          </Carousel>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <EventyButton
            onClick={() => navigate('/events')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: accent,
              '&:hover': {
                background: dark,
              },
            }}
          >
            View All Events
          </EventyButton>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 