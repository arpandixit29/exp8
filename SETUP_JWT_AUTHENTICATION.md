# 🚀 JWT Authentication - Complete Setup Guide

## Overview

This project implements a **full-stack JWT authentication system** with:
- ✅ Express backend with JWT token generation
- ✅ React frontend with protected routes
- ✅ Token persistence and verification
- ✅ Middleware-based route protection
- ✅ Axios automatic header injection

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- 2 Terminal windows

## 🎯 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd "c:\Users\Arpan\Desktop\exp 8\server"
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd "c:\Users\Arpan\Desktop\exp 8"
npm install
```

### Step 3: Start Backend Server (Terminal 1)
```bash
cd "c:\Users\Arpan\Desktop\exp 8\server"
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║   Authentication Server Running        ║
║   Port: 5000                         ║
║   URL: http://localhost:5000        ║
╚════════════════════════════════════════╝
```

### Step 4: Start Frontend (Terminal 2)
```bash
cd "c:\Users\Arpan\Desktop\exp 8"
npm start
```

**Expected Output:**
```
Compiled successfully!
On Your Network: ...
Localhost: http://localhost:3000
```

## 🔐 Test the Application

### 1. Access the Login Page
Open browser: `http://localhost:3000`

### 2. Demo Credentials
```
Email:    demo@example.com
Password: password123
```

### 3. Expected Flow
```
Login Page
    ↓ (enter credentials)
Loading Spinner (2 sec)
    ↓ (token received)
Success Alert
    ↓ (redirect after 1.5 sec)
Dashboard (Protected Route)
    ↓ (data fetched with JWT)
User Info + Statistics Display
```

### 4. Test Protected Routes
- ✅ Click "Settings" button → Should load settings page
- ✅ Navigate to `/dashboard` directly → Should work (authenticated)
- ✅ Try `/inventory` (non-existent) → Redirects to login
- ✅ Click "Logout" → Redirected to login
- ✅ Try to access `/dashboard` without login → Redirected to `/login`

## 🏗️ Architecture Overview

### Frontend Structure
```
React App
  ↓
AuthProvider (Context)
  ├─ useAuth() Hook
  ├─ Token Management
  └─ API Integration
    ↓
Router
  ├─ /login (Public)
  ├─ /dashboard (Protected)
  ├─ /settings (Protected)
  └─ /* (404 → login)
```

### Backend Structure
```
Express Server (Port 5000)
  ↓
Middleware
  ├─ CORS
  ├─ JSON Parser
  └─ JWT Verifier
    ↓
Routes
  ├─ POST /api/auth/login (Public)
  ├─ POST /api/auth/register (Public)
  ├─ GET /api/user/dashboard (Protected)
  ├─ GET /api/user/settings (Protected)
  └─ ... (more protected routes)
```

## 🔑 Key Files Explained

### Frontend

**[src/context/AuthContext.js](src/context/AuthContext.js)**
- Global authentication state management
- Token storage (localStorage)
- API call handling (login, register, logout)
- Token persistence on app load

**[src/context/ProtectedRoute.js](src/context/ProtectedRoute.js)**
- Route guard component
- Authentication check
- Redirect to login if not authenticated

**[src/components/LoginForm.js](src/components/LoginForm.js)**
- Login and registration forms
- Form validation with React Hook Form
- Calls `/api/auth/login` or `/api/auth/register`

**[src/components/Dashboard.js](src/components/Dashboard.js)**
- Protected route showing user dashboard
- Fetches data from `/api/user/dashboard`
- Requires valid JWT token

**[src/App.js](src/App.js)**
- React Router configuration
- Route definitions
- AuthProvider wrapper

### Backend

**[server/server.js](server/server.js)**

**Public Routes:**
- `POST /api/auth/login` - Returns JWT token
- `POST /api/auth/register` - Create account and return JWT
- `POST /api/auth/verify-token` - Verify token validity

**Protected Routes:**
- `GET /api/user/profile` - Get user profile
- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update settings
- `POST /api/auth/logout` - Logout user

## 🔄 Authentication Flow

```
1. USER SUBMITS LOGIN
   ┌─────────────────────────┐
   │ Email: demo@example.com │
   │ Password: password123   │
   └────────────┬────────────┘
                ↓

2. FRONTEND SENDS REQUEST
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "demo@example.com",
     "password": "password123"
   }
   ↓

3. BACKEND VALIDATES
   ✓ User exists?
   ✓ Password matches?
   ↓

4. TOKEN GENERATED
   Header: { alg: "HS256", typ: "JWT" }
   Payload: { id: 1, email: "...", name: "...", exp: ... }
   Signature: HMACSHA256(header.payload)
   ↓

5. RESPONSE SENT
   {
     "success": true,
     "token": "eyJhbGc...",
     "user": { id: 1, email: "..." }
   }
   ↓

6. FRONTEND STORES TOKEN
   localStorage.setItem('authToken', token)
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
   ↓

7. NAVIGATE TO DASHBOARD
   <ProtectedRoute>
     <Dashboard />
   </ProtectedRoute>
   ↓

8. FETCH PROTECTED DATA
   GET /api/user/dashboard
   Authorization: Bearer eyJhbGc...
   ↓

9. BACKEND VERIFIES TOKEN
   Extract token from Authorization header
   Verify signature with JWT_SECRET
   Decode payload
   ↓

10. FETCH AND RETURN DATA
    {
      "success": true,
      "data": {
        "userId": 1,
        "userName": "Demo User",
        ...
      }
    }
    ↓

11. DISPLAY DASHBOARD
    User info
    Statistics
    Settings button
    Logout button
```

## 🧪 Test Scenarios

### Scenario 1: Successful Login
```bash
1. Go to http://localhost:3000
2. Enter: demo@example.com / password123
3. Click "Login"
4. Expected: Spinner → Success alert → Redirect to /dashboard
```

### Scenario 2: Invalid Credentials
```bash
1. Go to http://localhost:3000
2. Enter: demo@example.com / wrongpassword
3. Click "Login"
4. Expected: Error alert "Invalid email or password"
```

### Scenario 3: Access Protected Route Without Auth
```bash
1. Go to http://localhost:3000/dashboard (without logging in)
2. Expected: Redirect to http://localhost:3000/login
```

### Scenario 4: Page Refresh With Valid Token
```bash
1. Login successfully
2. Press F5 (refresh)
3. Expected: Stay on dashboard, not logged out
```

### Scenario 5: Logout & Try Protected Route
```bash
1. Login and go to dashboard
2. Click "Logout"
3. Go to http://localhost:3000/dashboard
4. Expected: Redirect to login
```

### Scenario 6: Register New User
```bash
1. Go to http://localhost:3000/login
2. Click "Sign up here"
3. Enter: newemail@example.com / newname / password123
4. Click "Sign Up"
5. Expected: Success → Redirect to dashboard
```

### Scenario 7: Token Verification
```bash
1. Login to get token
2. Open DevTools → Application → localStorage
3. Copy 'authToken' value
4. Open terminal and run:
   curl -X POST http://localhost:5000/api/auth/verify-token \
     -H "Content-Type: application/json" \
     -d '{"token":"<paste-token-here>"}'
5. Expected: Success response with user data
```

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID <PID> /F

# Try starting backend again
npm start
```

### Frontend shows "Failed to load dashboard data"
```bash
# Check backend is running
curl http://localhost:5000/api/health

# If fails, restart backend
# Terminal 1:
cd server
npm start
```

### "Network Error" when logging in
```bash
# Ensure proxy is set in frontend package.json
"proxy": "http://localhost:5000"

# Restart frontend
npm start
```

### Always redirected to login
```bash
# Check localStorage
Browser DevTools → Application → Local Storage → authToken

# If missing, login again
# If present but redirects, backend might be rejecting token

# Check backend logs in Terminal 1
```

### CORS errors in console
```javascript
// CORS is handled in server.js
// If errors persist, restart both servers

// Terminal 1:
cd server && npm start

// Terminal 2:
npm start
```

## 📊 Monitoring

### Check Backend Status
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-04-15T08:30:00.000Z"
}
```

### Check Token Validity
```bash
# 1. Get token from localStorage (after login)
# Copy from: Browser DevTools → Application → localStorage → authToken

# 2. Test verification
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"<your-token>"}'
```

### Monitor API Calls
```bash
# Check Network tab in Browser DevTools:
# 1. Open DevTools (F12)
# 2. Go to Network tab
# 3. Login
# 4. Watch request/response:
#    - POST /api/auth/login
#    - GET /api/user/dashboard
#    - Observe Authorization headers
```

## 🔒 Security Notes

### ✅ What This Project Demonstrates
- JWT token creation and verification
- Protected route implementation
- Token storage in localStorage
- Middleware-based access control
- Automatic token injection in requests

### ⚠️ Production Improvements
- Use **HTTPS only** (not HTTP)
- Store JWT_SECRET in environment variables
- Implement **refresh tokens** for extended sessions
- Use **HttpOnly cookies** instead of localStorage
- Add **password hashing** (bcrypt)
- Use **real database** (MongoDB, PostgreSQL)
- Implement **rate limiting** on login
- Add **request logging** and monitoring
- Use **HTTPS/TLS** for all communications

## 📚 Next Steps

### 1. Understand the Code
- Read through `server/server.js` to understand middleware
- Review `src/context/AuthContext.js` for state management
- Study `src/context/ProtectedRoute.js` for route guards

### 2. Extend the Project
```javascript
// Add more protected routes
<Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />

// Add role-based access
// Add refresh token logic
// Connect to real database
```

### 3. Deploy to Production
```bash
# Build frontend
npm run build

# Deploy to Vercel, Netlify, or server
# Deploy backend to Heroku, AWS, or server
# Use environment variables for secrets
```

## 🎓 Learning Resources

- **JWT.io** - https://jwt.io (decode tokens, learn JWT)
- **React Router** - https://reactrouter.com
- **Express.js** - https://expressjs.com
- **jsonwebtoken** - https://github.com/auth0/node-jsonwebtoken
- **Axios** - https://axios-http.com

## ❓ FAQ

**Q: Where is the user data stored?**
A: In memory (mock database in `server.js`). For production, use MongoDB, PostgreSQL, etc.

**Q: How long does the token last?**
A: 24 hours (configurable in `server.js`). After expiration, user must login again.

**Q: Can I see the token contents?**
A: Yes, go to jwt.io and paste the token. You'll see its contents (but not the secret).

**Q: Is localStorage secure?**
A: For this demo, yes. Production should use HttpOnly cookies to prevent XSS attacks.

**Q: Can I add more user data to the token?**
A: Yes, modify the jwt.sign() payload in `/api/auth/login`.

---

## 🎉 You're All Set!

Your JWT authentication system is ready. Start both servers and test the authentication flow:

1. **Terminal 1:** `cd server && npm start`
2. **Terminal 2:** `cd exp\ 8 && npm start`
3. **Browser:** http://localhost:3000
4. **Login:** demo@example.com / password123
5. **Explore:** Dashboard → Settings → Logout → Try protected routes

**Enjoy learning JWT authentication secure route implementation!**
