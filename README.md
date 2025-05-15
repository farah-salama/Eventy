# Eventy - Event Management Platform

Eventy is a full-stack web application for event management and booking. It allows users to browse, book, and manage events, with special features for admins.

## Project Structure

The project is divided into two main parts:

- `frontend/` - React.js frontend application
- `backend/` - Node.js/Express.js backend server

## Quick Start

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   # Create .env file with MongoDB URI
   npm run dev
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   # Create .env file with API URL
   npm start
   ```

## Live Demo

- Backend API: https://eventy-backend-22e620254cab.herokuapp.com
- Frontend: [Not deployed yet]

## Features

- User authentication and authorization
- Event browsing and searching
- Event booking system
- Admin panel for event management
- Responsive design for all devices
- Real-time booking confirmations

## Documentation

For detailed documentation, please refer to:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Technologies

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for file uploads

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- Context API for state management 