# User Management Access System

A full-stack web application providing comprehensive user authentication, authorization, and software management capabilities. Built with React (TypeScript) frontend and Node.js backend with role-based access control.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for client-side routing
- **tailwindcss** for styling
- Context API for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** support
- **JWT** for authentication
- Database integration with TypeORM
- RESTful API architecture

  
## 🚀 Features

- **JWT Token System**
  - Dual token authentication (Access + Refresh tokens)
  - Access tokens: 15-minute expiration for security
  - Refresh tokens: 1-day expiration for user convenience
  - Automatic token refresh mechanism
  - Secure token validation and renewal

- **User Authentication & Authorization**
  - User registration and login with bcrypt password hashing
  - JWT-based authentication with dual token system
  - Role-based access control
  - Protected routes and middleware
  - Secure user profile retrieval

- **Dashboard Management**
  - User dashboard with personalized content
  - Admin dashboard for user management
  - Real-time data visualization

- **Software Access Management**
  - Software creation and registration (Admin only)
  - Access request system for software permissions
  - Three-tier access levels: Read, Write, Admin
  - Request approval workflow (Manager approval required)
  - Hierarchical access control with automatic permission inheritance

- **Request Management System**
  - Submit access requests with justification
  - Status tracking: Pending, Approved, Rejected
  - Prevent duplicate requests for same software
  - Smart access level validation and conflict resolution

- **Security**
  - Authentication middleware
  - Role-based authorization (Admin, Manager, User)
  - Protected API endpoints with role validation
  - Secure password handling
  - Access level hierarchy enforcement


## 📁 Project Structure

```
project-root/
├── backend/
│   ├── controllers/
│   │   ├── softwareControllers.js    # Software CRUD operations
│   │   └── userControllers.js        # User management logic
│   ├── db/
│   │   └── data-source.js           # Database configuration
│   ├── middlewares/
│   │   ├── Authenticate.js          # JWT authentication
│   │   └── Authorize.js             # Role-based authorization
│   ├── models/
│   │   └── entities/                # Database entities
│   ├── package.json
│   └── server.js                    # Entry point
│
└── frontend/
    └── src/
        ├── components/              # Reusable UI components
        ├── contexts/               # React Context providers
        ├── lib/                    # Utility functions
        ├── Pages/
        │   ├── Dashboard.tsx       # User dashboard
        │   ├── Home.tsx           # Home page
        │   ├── Login.tsx          # Authentication
        │   ├── Signup.tsx         # User registration
        │   └── Software.tsx       # Software management
        ├── App.tsx                # Main app component
        └── main.tsx              
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Database (MySQL/PostgreSQL/MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   [https://github.com/NAVEEN171/user-access-management-system](https://github.com/NAVEEN171/user-access-management-system)
   cd user-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   
   **Backend `.env` file:**
   ```env
   DATABASE_URL=your_database_connection_string
   JWT_ACCESS_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   ```

   **Frontend `.env` file:**
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   VITE_NODE_ENV=development
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

5. **Start the Application**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm start
   ```

   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT access token
- `GET /api/auth/get-user/:id` - Get user by ID



### Software Management
- `POST /api/software/create-software` - Create new software (Admin only)
- `GET /api/software/get-softwares` - Get all software entries
- `POST /api/software/requests` - Submit software access request (Authenticated)
- `GET /api/software/get-requests/:userId` - Get user-specific requests
- `GET /api/software/get-requests` - Get all requests 
- `PATCH /api/software/requests/:id` - Update request status (Manager only)

## 🛣️ Frontend Routes

- `/` - Home/Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard (Protected)
- `/create-software` - Software creation (Protected)

## 🔒 Authentication & Authorization

The application implements a comprehensive three-tier security system:

### User Roles
- **Admin** - Can create software, manage all system resources
- **Manager** - Can approve/reject access requests, view all requests
- **User** - Can request software access, view own requests

### Access Levels
Software access follows a hierarchical model:
- **Read** - Basic viewing permissions
- **Write** - Read permissions + modification rights  
- **Admin** - Write permissions + administrative control

### Security Features
1. **Authentication Middleware** - Verifies JWT tokens and user identity
2. **Role-based Authorization** - Checks user roles and permissions for specific endpoints
3. **Access Level Validation** - Prevents redundant requests for lower access levels
4. **Request Deduplication** - Blocks multiple pending requests for same software
5. **Token Security** - Short-lived access tokens with secure refresh mechanism
6. **Password Security** - bcrypt hashing with salt rounds for password protection

Protected routes require valid JWT tokens and appropriate user roles/access levels.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
cd backend
npm run build
npm start
```



