# Eventy Backend

This is the backend server for the Eventy application, a platform for event management and booking.

## Live API

The API is currently deployed at: `https://eventy-backend-22e620254cab.herokuapp.com`

## API Endpoints

- Authentication:
  - POST `/api/auth/register` - Register a new user
  - POST `/api/auth/login` - Login user
  - GET `/api/auth/me` - Get current user info

- Events:
  - GET `/api/events` - Get all events
  - GET `/api/events/:id` - Get event by ID
  - POST `/api/events` - Create new event (Admin only)
  - PUT `/api/events/:id` - Update event (Admin only)
  - DELETE `/api/events/:id` - Delete event (Admin only)

- Bookings:
  - GET `/api/bookings` - Get user's bookings
  - POST `/api/bookings` - Create new booking
  - GET `/api/bookings/event/:id` - Get bookings for an event (Admin only)

## Local Development

If you want to run the server locally:

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
PORT=5000
JWT_SECRET=your_secret_key
```
Add your mongodb connection string instead of the given one.

You can use `.env.example` as a reference for the required environment variables.

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for file uploads 