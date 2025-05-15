import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Sort as SortIcon } from '@mui/icons-material';
import axios from 'axios';
import theme from '../theme';
import EventyButton from '../common/EventyButton';

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

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('date_desc');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: [],
    date: '',
    venue: '',
    price: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      // The API returns events in a nested structure with pagination info
      setEvents(res.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    }
  };

  const handleOpen = (event = null) => {
    if (event) {
      setEditingEvent(event);
      // Ensure category is always an array and contains valid values
      const categories = event.category ? 
        (Array.isArray(event.category) ? event.category : [event.category]) : 
        [];
      
      // Filter out any invalid categories
      const validCategories = categories.filter(cat => CATEGORIES.includes(cat));
      
      setFormData({
        name: event.name,
        description: event.description,
        category: validCategories,
        date: new Date(event.date).toISOString().split('T')[0],
        venue: event.venue,
        price: event.price,
        image: event.image,
      });
      setImageFile(null);
    } else {
      setEditingEvent(null);
      setFormData({
        name: '',
        description: '',
        category: [],
        date: '',
        venue: '',
        price: '',
        image: '',
      });
      setImageFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    setImageUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUploading(false);
      return res.data.url;
    } catch (error) {
      setImageUploading(false);
      alert('Image upload failed. Please try again.');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure we have at least one category
      if (!formData.category || formData.category.length === 0) {
        alert('Please select at least one category');
        return;
      }

      // Ensure all categories are valid
      const invalidCategories = formData.category.filter(cat => !CATEGORIES.includes(cat));
      if (invalidCategories.length > 0) {
        alert(`Invalid categories: ${invalidCategories.join(', ')}. Please select from the predefined categories.`);
        return;
      }

      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return;
      }

      const eventPayload = { ...formData, image: imageUrl };

      if (editingEvent) {
        const response = await axios.put(`${API_URL}/api/events/${editingEvent._id}`, eventPayload);
        if (response.data) {
          fetchEvents();
          handleClose();
        }
      } else {
        const response = await axios.post(`${API_URL}/api/events`, eventPayload);
        if (response.data) {
          fetchEvents();
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.message || 'Error saving event';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        alert(`Validation errors:\n${validationErrors.join('\n')}`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API_URL}/api/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSort = (event) => {
    setSortBy(event.target.value);
  };

  const getFilteredAndSortedEvents = () => {
    if (!Array.isArray(events)) {
      return [];
    }
    
    let filteredEvents = [...events];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        const eventCategories = Array.isArray(event.category) ? event.category : [event.category];
        return selectedCategories.some(cat => eventCategories.includes(cat));
      });
    }

    // Apply sorting
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
      <Container maxWidth="md"
        sx={{
          background: cardBg,
          borderRadius: '32px',
          boxShadow: cardShadow,
          px: { xs: 2, sm: 6 },
          py: { xs: 3, sm: 6 },
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Event Management
          </Typography>
          <EventyButton onClick={() => handleOpen()}>Add New Event</EventyButton>
        </Box>

        {/* Filters and Sort Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', mb: 1, fontWeight: 600 }}>
                Filter by Categories:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {CATEGORIES.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryFilter(category)}
                    sx={{
                      background: selectedCategories.includes(category) ? accent : '#f0f0f0',
                      color: selectedCategories.includes(category) ? '#fff' : dark,
                      '&:hover': {
                        background: selectedCategories.includes(category) ? accent : '#e0e0e0',
                      },
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
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
          {getFilteredAndSortedEvents().map((event) => (
            <Grid item xs={12} key={event._id}>
              <Paper
                sx={{
                  p: 2,
                  background: cardBg,
                  borderRadius: '24px',
                  boxShadow: cardShadow,
                  mb: 2,
                  border: 'none',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: accent, fontWeight: 700 }}>
                      {event.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {Array.isArray(event.category) ? event.category.join(', ') : event.category} • {formatDate(event.date)} • ${event.price}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpen(event)} sx={{ color: accent }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(event._id)} sx={{ color: '#ff7675' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: cardBg,
              borderRadius: '24px',
              boxShadow: cardShadow,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ color: accent, fontWeight: 700 }}>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    sx={{ background: '#f6f6fa', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                    sx={{ background: '#f6f6fa', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ background: '#f6f6fa', borderRadius: 2 }}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      input={<OutlinedInput label="Categories" />}
                      required
                    >
                      {CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ background: '#f6f6fa', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    sx={{ background: '#f6f6fa', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    sx={{ background: '#f6f6fa', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                    Event Image
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                    <input
                      accept="image/*"
                      type="file"
                      onChange={handleImageFileChange}
                      style={{ display: 'block' }}
                    />
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>or</Typography>
                    <TextField
                      fullWidth
                      label="Image URL"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      disabled={!!imageFile}
                      sx={{ background: '#f6f6fa', borderRadius: 2, flex: 1 }}
                    />
                  </Box>
                  {imageUploading && (
                    <Typography sx={{ color: accent, mt: 1 }}>Uploading image...</Typography>
                  )}
                  {(formData.image || imageFile) && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                        alt="Preview"
                        style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: cardShadow }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <EventyButton variant="text" onClick={handleClose} sx={{ color: accent, fontWeight: 700 }}>Cancel</EventyButton>
              <EventyButton type="submit">{editingEvent ? 'Update' : 'Create'}</EventyButton>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanel; 