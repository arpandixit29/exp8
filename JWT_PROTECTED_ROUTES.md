# 🔐 JWT Protected Routes Implementation

## Project Overview

This project demonstrates a complete **JWT (JSON Web Token) authentication system** with protected routes using React Router, Express backend, and secure token verification.

## Architecture

### Frontend (React)
- React Router 6+ for client-side routing
- React Hook Form for form validation
- Axios for API requests with JWT headers
- Context API for global authentication state

### Backend (Express)
- JWT token generation and verification
- CORS support for cross-origin requests
- Middleware-based route protection
- Mock user database

## 🚀 Quick Start

### Terminal 1: Start Backend Server
```bash
cd server
npm install
npm start
```
Server runs on: `http://localhost:5000`

### Terminal 2: Start Frontend (React)
```bash
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

## 📋 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 USER AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. USER LOGS IN
   └─→ Email + Password sent to /api/auth/login
   
2. BACKEND VALIDATES
   └─→ Checks credentials against user database
   
3. JWT TOKEN GENERATED
   └─→ Token contains: { id, email, name, expiresIn: '24h' }
   └─→ Returns token to frontend
   
4. FRONTEND STORES TOKEN
   └─→ Saved in localStorage: 'authToken'
   └─→ Added to axios default headers
   
5. PROTECTED ROUTES
   └─→ Axios automatically includes token in: Authorization: Bearer <token>
   └─→ Backend verifies token before allowing access
   
6. TOKEN VERIFICATION
   └─→ Middleware checks token validity
   └─→ If valid: User data added to request, route accessed
   └─→ If invalid: 403 error, user redirected to login
```

## 🔑 Key Components

### 1. Authentication Context (`src/context/AuthContext.js`)

Manages global authentication state:
```javascript
const { user, token, loading, isAuthenticated, login, register, logout } = useAuth();
```

**Features:**
- Global state management
- Token persistence with localStorage
- Axios header configuration
- Token verification on app load
- Login/Register/Logout functions

### 2. Protected Route Component (`src/context/ProtectedRoute.js`)

Wraps routes that require authentication:
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**Logic:**
- If not authenticated → redirects to `/login`
- If authenticated → renders protected component
- Shows loading spinner during verification

### 3. Login Form (`src/components/LoginForm.js`)

Public login/registration page:
- Email and password validation
- Sign-up support with name field
- Toggle between login and signup
- Prevents submission until backend responds
- Shows success/error alerts

### 4. Dashboard (`src/components/Dashboard.js`)

Protected route showing user data:
- Displays user profile information
- Shows dashboard statistics loaded from `/api/user/dashboard`
- Navigation to Settings
- Logout functionality

### 5. Settings (`src/components/Settings.js`)

Protected route for user preferences:
- Language and theme selection
- Notification preferences
- Calls `/api/user/settings` endpoints
- Demonstrates PUT requests with JWT

## 📡 API Endpoints

### PUBLIC ENDPOINTS (No JWT Required)

#### POST `/api/auth/login`
Login with email and password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "demo@example.com",
    "name": "Demo User"
  }
}
```

#### POST `/api/auth/register`
Register new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"john123","name":"John Doe"}'
```

#### POST `/api/auth/verify-token`
Verify if token is valid
```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGc..."}'
```

#### GET `/api/health`
Health check
```bash
curl http://localhost:5000/api/health
```

### PROTECTED ENDPOINTS (JWT Required)

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/user/profile`
Get current user profile
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/user/profile
```

#### GET `/api/user/dashboard`
Get dashboard data
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/user/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userName": "Demo User",
    "email": "demo@example.com",
    "lastLogin": "2026-04-15T08:30:00Z",
    "permissions": ["read", "write"],
    "loginCount": 42
  }
}
```

#### GET `/api/user/settings`
Get user settings
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/user/settings
```

#### PUT `/api/user/settings`
Update user settings
```bash
curl -X PUT http://localhost:5000/api/user/settings \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "language":"en",
    "theme":"dark",
    "notifications":true,
    "emailUpdates":false
  }'
```

#### POST `/api/auth/logout`
Logout user (removes server-side session if needed)
```bash
curl -X POST -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/auth/logout
```

## 🧪 Demo Credentials

```
Email:    demo@example.com
Password: password123
```

Other demo users available:
```
Email:    john@example.com
Password: john123

Email:    jane@example.com
Password: jane123
```

## 🛡️ Security Implementation

### JWT Token Structure
```
Header.Payload.Signature

Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": 1,
  "email": "demo@example.com",
  "name": "Demo User",
  "iat": 1681234567,
  "exp": 1681320967
}

Signature: HMACSHA256(base64(header) + "." + base64(payload))
```

### Token Verification Middleware
```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
```

### Frontend Token Handling
```javascript
// Stored in localStorage
localStorage.setItem('authToken', token);

// Automatically added to all axios requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Verified on app load
useEffect(() => {
  if (token) {
    axios.post('/api/auth/verify-token', { token });
  }
}, []);
```

## 🔄 Authentication State Flow

```
App Loads
  ↓
AuthProvider checks localStorage for token
  ↓
Found? → Verify token with backend
  ↓
Valid? → Set authenticated state
  ↓
User can access protected routes
```

## 📊 Project Structure

```
exp 8/
├── server/                          # Backend Express server
│   ├── server.js                   # Main server file with all routes
│   ├── package.json               # Backend dependencies
│   └── node_modules/              # Backend packages
│
├── src/                            # Frontend React source
│   ├── context/
│   │   ├── AuthContext.js         # Global auth state + hooks
│   │   └── ProtectedRoute.js      # Route guard component
│   │
│   ├── components/
│   │   ├── LoginForm.js           # Login/Register page
│   │   ├── Dashboard.js           # Protected dashboard
│   │   └── Settings.js            # Protected settings page
│   │
│   ├── styles/
│   │   ├── LoginForm.css          # Login styling
│   │   ├── Dashboard.css          # Dashboard styling
│   │   └── Settings.css           # Settings styling
│   │
│   ├── App.js                     # Main app with routes
│   ├── index.js                   # React entry point
│   └── index.css                  # Global styles
│
├── public/
│   └── index.html                 # HTML template
│
├── package.json                   # Frontend dependencies
├── README.md                      # Project documentation
├── IMPLEMENTATION.md              # Technical details
├── GETTING_STARTED.md            # Quick start guide
└── JWT_PROTECTED_ROUTES.md        # This file
```

## 🔄 Request-Response Examples

### Login Request Flow

**1. User clicks "Login"**
```javascript
// Frontend
const response = await axios.post('/api/auth/login', {
  email: 'demo@example.com',
  password: 'password123'
});
```

**2. Backend receives request**
```javascript
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Validate credentials
  // Generate JWT
  // Return token
});
```

**3. Frontend stores token**
```javascript
const token = response.data.token;
localStorage.setItem('authToken', token);
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**4. Redirect to protected route**
```javascript
navigate('/dashboard');
```

### Protected Route Request Flow

**1. User navigates to /dashboard**
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**2. ProtectedRoute checks authentication**
```javascript
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
return children;
```

**3. Dashboard component makes API call**
```javascript
const response = await axios.get('/api/user/dashboard');
// Token automatically included in headers
```

**4. Backend middleware verifies token**
```javascript
app.get('/api/user/dashboard', verifyToken, (req, res) => {
  // req.user contains decoded token data
  // Can access user ID: req.user.id
});
```

**5. Return protected data to frontend**

## 🔒 Security Best Practices

### ✅ Implemented
- JWT tokens with expiration (24 hours)
- Token verification middleware on protected routes
- Password validation (minimum 6 characters)
- Secure token storage in localStorage
- CORS support for API requests
- Automatic token refresh concept ready

### ⚠️ Production Improvements Needed
- Use HTTPS only (not HTTP)
- Move JWT_SECRET to environment variables
- Implement refresh tokens for extended sessions
- Use HttpOnly cookies for token storage (more secure than localStorage)
- Add rate limiting on login attempts
- Implement password hashing (bcrypt)
- Add database for persistent user storage
- Implement roles and permissions (RBAC)
- Add request logging and monitoring

## 🧪 Testing Protected Routes

### Test 1: Access protected route without login
1. Open browser
2. Go to `http://localhost:3000/dashboard`
3. **Expected:** Redirected to `/login`

### Test 2: Login successfully
1. Go to `http://localhost:3000/login`
2. Enter: `demo@example.com` / `password123`
3. Click "Login"
4. **Expected:** Redirected to `/dashboard` with user data

### Test 3: Access protected route with valid token
1. After successful login
2. Navigate to `/settings`
3. **Expected:** Settings page loads with user preferences

### Test 4: Logout and verify redirect
1. Click "Logout"
2. Try to access `/dashboard`
3. **Expected:** Redirected to `/login`

### Test 5: Verify token on page refresh
1. Login successfully
2. Refresh page (F5)
3. **Expected:** User remains logged in, no redirect

## 🐛 Troubleshooting

### Issue: "Failed to load dashboard data"
**Solution:**
- Check backend server is running on port 5000
- Verify token is being sent in Authorization header
- Check browser console for CORS errors

### Issue: Always redirected to login
**Solution:**
- Check localStorage has 'authToken'
- Verify token hasn't expired
- Check browser DevTools → Network → see Authorization header

### Issue: Backend returns 403 (Forbidden)
**Solution:**
- Token is invalid or expired
- Logout and login again
- Check JWT_SECRET matches between Frontend and Backend

### Issue: CORS errors
**Solution:**
- Ensure backend includes CORS middleware: `app.use(cors())`
- Check proxy in frontend package.json: `"proxy": "http://localhost:5000"`

## 📚 Resources

- [JWT Introduction](https://jwt.io/)
- [React Router Docs](https://reactrouter.com/)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [jsonwebtoken Library](https://github.com/auth0/node-jsonwebtoken)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

## 🎓 Learning Path

1. **Understand JWT Flow:** Read this document and diagrams
2. **Examine Backend Code:** Review `server/server.js` for middleware
3. **Review Frontend Code:** Check `src/context/AuthContext.js`
4. **Test Endpoints:** Use curl/Postman to test API directly
5. **Trace Data Flow:** Debug in browser to see token usage
6. **Modify & Experiment:** Add new protected routes or endpoints

---

**This project demonstrates production-ready JWT authentication patterns while remaining educational and easy to understand.**
