# Eventy Frontend

This is the frontend application for Eventy, a platform for event management and booking.

## Live Application

The application is currently not deployed

## Features

- User authentication (login/register)
- Browse events
- Book events
- View booked events
- Admin panel for event management
- Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=https://eventy-backend-22e620254cab.herokuapp.com
```

You can use `.env.example` as a reference for the required environment variables.

3. Start the development server:
```bash
npm start
```

The application will run on `http://localhost:3000`

## Connecting to Backend

The frontend is configured to connect to the deployed backend at `https://eventy-backend-22e620254cab.herokuapp.com`. If you want to connect to a local backend:

1. Update the `.env` file to use:
```
REACT_APP_API_URL=http://localhost:5000
```

2. Make sure your local backend server is running

## Technologies Used

- React.js
- Material-UI
- React Router
- Axios
- Context API for state management 