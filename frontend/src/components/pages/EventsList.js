import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import theme from '../theme';
import EventyButton from '../common/EventyButton';
import { 
  CalendarToday, 
  LocationOn, 
  AttachMoney, 
  Sort as SortIcon,
  Category as CategoryIcon 
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const { accent, dark, gray, cardBg, cardShadow, gradientBg } = theme;

const CATEGORIES = [
  'Arts & Entertainment',
  'Sports & Outdoors',
  'Learning & Career',
  'Community & Causes'
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
];

// Helper to format date as dd/mm/yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper to fire confetti
const fireConfetti = () => {
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
};

// Helper to get full image URL
const getImageUrl = (img) => img?.startsWith('/uploads/') ? `${API_URL}${img}` : img;

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const confettiFired = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        
        let url = `${API_URL}/api/events?page=${page}`;
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        const res = await axios.get(url);
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
        setTotalEvents(res.data.totalEvents);
        console.log('Fetched events:', res.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchBookedEvents = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get(`${API_URL}/api/bookings`);
          const confirmedBookings = res.data.filter(booking => booking.status === 'confirmed');
          setBookedEvents(confirmedBookings.map(booking => booking.event._id));
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchEvents();
      if (isAuthenticated) {
        await fetchBookedEvents();
      }
      setLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [isAuthenticated, authLoading, location.search, page]);

  useEffect(() => {
    if (bookingSuccess && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
    if (!bookingSuccess) {
      confettiFired.current = false;
    }
  }, [bookingSuccess]);

  const handleViewDetails = (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/event/${eventId}`);
  };

  const handleBookNow = (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdmin) {
      return;
    }
    setSelectedEventId(eventId);
    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      await axios.post(`${API_URL}/api/bookings`, { eventId: selectedEventId });
      setBookedEvents(prev => [...prev, selectedEventId]);
      setBookingSuccess(true);
      setConfirmOpen(false);
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Error booking event');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSort = (event) => {
    setSortBy(event.target.value);
  };

  const getFilteredAndSortedEvents = () => {
    if (!Array.isArray(events)) {
      return [];
    }
    
    let filteredEvents = [...events];
    
    if (selectedCategories.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        const eventCategories = Array.isArray(event.category) ? event.category : [event.category];
        return selectedCategories.some(cat => eventCategories.includes(cat));
      });
    }

    const [field, direction] = sortBy.split('_');
    filteredEvents.sort((a, b) => {
      let comparison = 0;
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (field === 'price') {
        comparison = Number(a.price) - Number(b.price);
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return filteredEvents;
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
        {/* Filters and Sort Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'var(--text-primary)' }}>Filter by Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(e.target.value)}
                  label="Filter by Categories"
                  startAdornment={<CategoryIcon sx={{ color: accent, mr: 1 }} />}
                  sx={{ background: 'var(--background-secondary)', borderRadius: 2, color: 'var(--text-primary)' }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'var(--background-secondary)',
                        color: 'var(--text-primary)',
                      },
                    },
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          sx={{
                            background: accent,
                            color: '#fff',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category} sx={{ color: 'var(--text-primary)' }}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'var(--text-primary)' }}>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSort}
                  label="Sort By"
                  startAdornment={<SortIcon sx={{ color: accent, mr: 1 }} />}
                  sx={{ background: 'var(--background-secondary)', borderRadius: 2, color: 'var(--text-primary)' }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'var(--background-secondary)',
                        color: 'var(--text-primary)',
                      },
                    },
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{ color: 'var(--text-primary)' }}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          {getFilteredAndSortedEvents().length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ color: 'var(--text-secondary)', mt: 4, fontSize: '1.2rem' }}>
                No events found.
              </Typography>
            </Grid>
          ) : (
            getFilteredAndSortedEvents().map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: cardBg,
                    borderRadius: '24px',
                    boxShadow: cardShadow,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(event.image) || 'https://via.placeholder.com/400x200'}
                    alt={event.name}
                    sx={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>
                      {(Array.isArray(event.category) ? event.category : [event.category]).map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          sx={{
                            background: accent,
                            color: '#fff',
                            mr: 1,
                            mb: 1,
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="h6" component="h2" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}>
                      {event.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: accent, fontSize: '1rem' }} />
                        {formatDate(event.date)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ color: accent, fontSize: '1rem' }} />
                        {event.venue}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ color: accent, fontSize: '1rem' }} />
                        {event.price}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <EventyButton
                        onClick={() => handleViewDetails(event._id)}
                        sx={{
                          flex: 1,
                          px: 1.5,
                          py: 1.5,
                          fontSize: '1rem',
                          minHeight: 36,
                          background: 'transparent',
                          color: accent,
                          boxShadow: 'none',
                          border: `1.5px solid ${accent}`,
                          transition: 'background 0.2s, color 0.2s',
                          '&:hover': {
                            background: accent,
                            color: '#fff',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        View Details
                      </EventyButton>
                      {!isAdmin && (
                        new Date(event.date) < new Date() ? (
                          <EventyButton
                            sx={{ flex: 1, background: gray, color: '#fff', cursor: 'not-allowed', opacity: 0.7, px: 1.5, py: 1.5, fontSize: '1rem', minHeight: 36 }}
                            disabled
                          >
                            Ended
                          </EventyButton>
                        ) : bookedEvents.includes(event._id) ? (
                          <EventyButton
                            sx={{ flex: 1, background: accent, color: '#fff', cursor: 'not-allowed', opacity: 0.7, px: 1.5, py: 1.5, fontSize: '1rem', minHeight: 36 }}
                            disabled
                          >
                            Booked
                          </EventyButton>
                        ) : (
                          <EventyButton
                            onClick={() => handleBookNow(event._id)}
                            sx={{ flex: 1, background: '#23272f', '&:hover': { background: '#181b20' }, px: 1.5, py: 1.5, fontSize: '1rem', minHeight: 36 }}
                          >
                            Book Now
                          </EventyButton>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'var(--text-primary)',
                '&.Mui-selected': {
                  background: accent,
                  color: '#fff',
                  '&:hover': {
                    background: dark,
                  },
                },
              },
            }}
          />
        </Box>
      </Container>

      {/* Booking Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
          },
        }}
      >
        <DialogTitle sx={{ color: accent, fontWeight: 700 }}>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to book this event?</Typography>
          {bookingError && <Typography color="error" sx={{ mt: 1 }}>{bookingError}</Typography>}
        </DialogContent>
        <DialogActions>
          <EventyButton variant="text" onClick={() => setConfirmOpen(false)} sx={{ color: accent, fontWeight: 700, background: 'transparent', '&:hover': { background: '#f3eaff', color: accent } }}>Cancel</EventyButton>
          <EventyButton onClick={handleConfirmBooking} disabled={bookingLoading}>
            {bookingLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Confirm'}
          </EventyButton>
        </DialogActions>
      </Dialog>

      {/* Booking Success Dialog */}
      <Dialog open={bookingSuccess} onClose={() => setBookingSuccess(false)}
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
          <EventyButton variant="text" onClick={() => setBookingSuccess(false)} sx={{ color: accent, fontWeight: 700, background: 'transparent', '&:hover': { background: '#f3eaff', color: accent } }}>Close</EventyButton>
          <EventyButton
            variant="text"
            onClick={() => {
              setBookingSuccess(false);
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

export default EventsList; 