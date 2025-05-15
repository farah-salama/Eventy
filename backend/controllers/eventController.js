const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const { validationResult } = require('express-validator');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Get paginated events
    const events = await Event.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      events,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalEvents: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    console.log('Received update request with body:', req.body);
    console.log('Category value:', req.body.category);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('Current event categories:', event.category);

    // Ensure category is an array and contains valid values
    if (req.body.category) {
      if (!Array.isArray(req.body.category)) {
        req.body.category = [req.body.category];
      }
      
      console.log('Processed categories:', req.body.category);
      
      // Validate categories
      const validCategories = ['Arts & Entertainment', 'Sports & Outdoors', 'Learning & Career', 'Community & Causes'];
      const invalidCategories = req.body.category.filter(cat => !validCategories.includes(cat));
      
      console.log('Invalid categories found:', invalidCategories);
      
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          message: 'Invalid categories',
          errors: [`Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}`]
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    console.log('Updated event:', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete all bookings associated with this event
    await Booking.deleteMany({ event: req.params.id });

    // Delete the event
    await event.deleteOne();
    
    res.json({ message: 'Event and associated bookings removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
}; 