import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';
import { CalendarToday, LocationOn, AttachMoney, Search } from '@mui/icons-material';

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

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const confettiFired = useRef(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        setError('Error fetching event details');
      }
    };

    const checkBookingStatus = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get(`${API_URL}/api/bookings`);
          const booking = res.data.find(booking => 
            booking.event._id === id && booking.status === 'confirmed'
          );
          setIsBooked(!!booking);
        } catch (error) {
          console.error('Error checking booking status:', error);
        }
      }
    };

    const fetchEventBookings = async () => {
      if (isAdmin) {
        try {
          const res = await axios.get(`${API_URL}/api/bookings/event/${id}`);
          setBookings(res.data);
        } catch (error) {
          console.error('Error fetching event bookings:', error);
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchEvent();
      if (isAuthenticated) {
        await checkBookingStatus();
      }
      if (isAdmin) {
        await fetchEventBookings();
      }
      setLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [id, isAuthenticated, authLoading, isAdmin]);

  useEffect(() => {
    if (showSuccess && !confettiFired.current) {
      confettiFired.current = true;
      // Dynamically load the confetti library if not already loaded
      function fireRealisticConfetti() {
        if (!window.confetti) return;
        var count = 200;
        var defaults = { origin: { y: 0.7 } };
        function fire(particleRatio, opts) {
          window.confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
          }));
        }
        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      }
      if (!window.confetti) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
        script.async = true;
        script.onload = fireRealisticConfetti;
        document.body.appendChild(script);
      } else {
        fireRealisticConfetti();
      }
    }
    if (!showSuccess) {
      confettiFired.current = false;
    }
  }, [showSuccess]);

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdmin) {
      return; // Don't allow admins to book events
    }

    try {
      await axios.post(`${API_URL}/api/bookings`, {
        eventId: id,
      });
      setShowSuccess(true);
      setIsBooked(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error booking event');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!event) {
    return null;
  }

  const isEnded = new Date(event.date) < new Date();

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
        <Box sx={{ position: 'relative', mb: 3 }}>
          <img
            src={getImageUrl(event.image) || 'https://via.placeholder.com/800x400'}
            alt={event.name}
            style={{
              width: '100%',
              height: '340px',
              objectFit: 'cover',
              borderRadius: '24px',
              boxShadow: cardShadow,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {(Array.isArray(event.category) ? event.category : [event.category]).map((cat) => (
              <Chip
                key={cat}
                label={cat}
                sx={{
                  background: accent,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                }}
              />
            ))}
          </Box>
        </Box>
        <Typography variant="h4" component="h1" align="center" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 2 }}>
          {event.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ color: accent, fontSize: '1.2rem' }} /> {formatDate(event.date)}
          </Typography>
          <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ color: accent, fontSize: '1.2rem' }} /> {event.venue}
          </Typography>
          <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoney sx={{ color: accent, fontSize: '1.2rem' }} />{event.price}
          </Typography>
        </Box>
        <Typography align="center" sx={{ color: 'var(--text-secondary)', mb: 3, fontSize: '1.1rem' }}>
          {event.description}
        </Typography>
        {isBooked ? (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Chip
              label="Booked"
              sx={{
                background: '#23272f',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: '999px',
                px: 4,
                py: 1.2,
                mb: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
              You have successfully booked this event
            </Typography>
          </Box>
        ) : isEnded ? (
          <EventyButton disabled sx={{ width: '100%', mt: 3, background: gray, color: '#fff', opacity: 0.7, fontWeight: 700, fontSize: '1.1rem', borderRadius: '999px', px: 4, py: 1.2 }}>
            Ended
          </EventyButton>
        ) : !isAdmin ? (
          <EventyButton onClick={handleBookNow} sx={{ width: '100%', mt: 3, background: '#23272f', color: '#fff', '&:hover': { background: '#181b20' } }}>Book Now</EventyButton>
        ) : null}

        {/* Admin Bookings Section */}
        {isAdmin && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 3 }}>
              Confirmed Bookings
            </Typography>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: accent, mr: 1 }} />,
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
                      color: gray,
                      opacity: 0.8,
                    },
                  },
                }}
              />
            </Box>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: '24px',
                boxShadow: '0 4px 24px 0 rgba(80, 80, 180, 0.10)',
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid #f0f0f0',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        color: dark,
                        fontSize: '1rem',
                        py: 2,
                        borderBottom: '2px solid #f0f0f0',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        color: dark,
                        fontSize: '1rem',
                        py: 2,
                        borderBottom: '2px solid #f0f0f0',
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        color: dark,
                        fontSize: '1rem',
                        py: 2,
                        borderBottom: '2px solid #f0f0f0',
                      }}
                    >
                      Booking Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={3} 
                        align="center" 
                        sx={{ 
                          py: 4, 
                          color: gray,
                          fontSize: '1.1rem',
                        }}
                      >
                        No confirmed bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow 
                        key={booking._id}
                        sx={{
                          '&:hover': {
                            background: '#f8f8ff',
                          },
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            color: dark,
                            fontSize: '1rem',
                            py: 2,
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          {booking.user.name}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: dark,
                            fontSize: '1rem',
                            py: 2,
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          {booking.user.email}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            color: dark,
                            fontSize: '1rem',
                            py: 2,
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          {formatDate(booking.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
          },
        }}
      >
        <DialogTitle sx={{ color: accent, fontWeight: 700 }}>Booking Successful!</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--text-secondary)' }}>
            You have successfully booked this event. You can view your bookings in the "My Bookings" section.
          </Typography>
        </DialogContent>
        <DialogActions>
          <EventyButton variant="text" onClick={() => setShowSuccess(false)} sx={{ color: accent, fontWeight: 700, background: 'transparent', '&:hover': { background: '#f3eaff', color: accent } }}>Close</EventyButton>
          <EventyButton
            variant="text"
            onClick={() => {
              setShowSuccess(false);
              navigate('/booked-events');
            }}
            sx={{ color: accent, fontWeight: 700, background: 'transparent', '&:hover': { background: '#f3eaff', color: accent } }}
          >
            View My Bookings
          </EventyButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails;