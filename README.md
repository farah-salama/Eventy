# Eventy - Event Management Platform

Eventy is a full-stack web application for event management and booking. It allows users to browse, book, and manage events, with special features for admins.

## Project Structure

The project is divided into two main parts:

- `frontend/` - React.js frontend application
- `backend/` - Node.js/Express.js backend server

## Setup

For detailed setup instructions, please refer to:
- [Backend Documentation](./backend/README.md) - For backend server setup
- [Frontend Documentation](./frontend/README.md) - For frontend application setup

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

## Creating an Admin User

To create an admin user for the application:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Edit the `scripts/createAdmin.js` file to change the default admin credentials:
   - Email: admin@eventy.com
   - Password: admin123

3. Run the admin creation script:
   ```bash
   node scripts/createAdmin.js
   ```

This will create an admin user with the following credentials:
- Email: admin@eventy.com
- Password: admin123

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
