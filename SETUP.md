# Dating App Frontend Setup

## Installation

1. Navigate to the frontend directory:
```bash
cd dating_app_frontend
```

2. Install dependencies:
```bash
npm install axios react-router-dom
```

## Running the Development Server

Start the development server:
```bash
npm run dev
```

The app will be available at: http://localhost:5173

## Project Structure

```
src/
├── api/
│   └── axios.js          # API client configuration
├── pages/
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   ├── Dashboard.jsx     # Swipe/Discovery page
│   ├── Matches.jsx       # View all matches
│   ├── Messages.jsx      # Chat with matches
│   ├── Auth.css         # Auth pages styling
│   ├── Dashboard.css    # Dashboard styling
│   ├── Matches.css      # Matches page styling
│   └── Messages.css     # Messages page styling
├── App.jsx              # Main app with routing
└── App.css              # Global styles
```

## Features

- ✅ User Authentication (Login/Register)
- ✅ Swipe Interface (Like/Dislike/Super Like)
- ✅ View Matches
- ✅ Real-time Messaging
- ✅ Protected Routes
- ✅ Responsive Design

## Backend Connection

The frontend connects to the backend API at:
```
http://127.0.0.1:8000
```

Make sure the backend server is running before using the frontend.

## Note

Some features require backend endpoints that need to be implemented:
- `/auth/login` - User login
- `/users/discover` - Get potential matches
- Additional user profile endpoints
