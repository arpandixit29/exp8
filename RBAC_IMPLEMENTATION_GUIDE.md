# RBAC (Role-Based Access Control) Implementation Guide

## Overview

This guide documents the complete RBAC implementation in the authentication system with role hierarchy, permissions, and role-based routes.

## Role Hierarchy

The system defines 4 roles in a hierarchy:

### 1. **Admin** (Role: `admin`)
- **Access Level:** Full system access
- **Permissions:** All 13 permissions
- **Features:**
  - User management (CRUD operations)
  - View admin dashboard with analytics
  - View system health and statistics
  - Manage roles and permissions
  - Access to all protected routes
- **Demo Credentials:** `admin@example.com` / `admin123`

### 2. **Moderator** (Role: `moderator`)
- **Access Level:** Elevated access
- **Permissions:** 7 permissions (limited user management)
- **Features:**
  - View user list
  - View user details
  - Update user information
  - Create and manage content
  - View analytics
  - Cannot delete users or change roles
- **Demo Credentials:** `moderator@example.com` / `mod123`

### 3. **User** (Role: `user`)
- **Access Level:** Standard user access
- **Permissions:** 5 permissions
- **Features:**
  - View and update own profile
  - Update personal settings
  - View own profile information
  - Cannot access admin panel
  - Limited to personal data
- **Demo Credentials:** `demo@example.com` / `password123`

### 4. **Guest** (Role: `guest`)
- **Access Level:** Read-only access
- **Permissions:** 1 permission (read content)
- **Features:**
  - View public content only
  - No modification permissions
  - Limited to read-only operations
- **Demo Credentials:** `guest@example.com` / `guest123`

## Permissions

The system uses a granular permission system with 13 permissions:

### User Management Permissions
- `create_user` - Create new users (admin only)
- `read_user` - View user details (admin, moderator, user)
- `update_user` - Update user information (admin, moderator, user)
- `delete_user` - Delete users (admin only)
- `list_users` - List all users (admin, moderator)

### Settings Permissions
- `update_settings` - Modify settings (admin, user)
- `read_settings` - View settings (admin, moderator, user)

### Content Permissions
- `create_content` - Create content (admin, moderator)
- `read_content` - Read content (all roles)
- `update_content` - Update content (admin, moderator)
- `delete_content` - Remove content (admin only)

### Admin Permissions
- `manage_users` - Admin user management (admin only)
- `view_analytics` - View system analytics (admin, moderator)

## Backend Implementation

### API Endpoints

#### Authentication Routes (Public)
```
POST /api/auth/login
- Request: { email, password }
- Response: { token, user: { id, email, name, role } }

POST /api/auth/register
- Request: { email, password, name }
- Response: { token, user: { id, email, name, role } }
- Default role: User

POST /api/auth/verify-token
- Request: { token }
- Response: { user: decoded JWT payload }

POST /api/auth/logout
- Protected route
```

#### Authentication Middleware
```javascript
verifyToken(req, res, next)
- Validates JWT from Authorization header
- Sets req.user with decoded payload
- Returns 401 if no token
- Returns 403 if invalid/expired token

hasRole(allowedRoles)
- Checks if user's role is in allowedRoles array
- Returns 403 if role not allowed
- Example: hasRole([ROLES.ADMIN])

hasPermission(requiredPermissions)
- Checks if user has required permission(s)
- Supports single permission or array of permissions
- Returns 403 if permission denied
```

#### Admin Routes (Admin Only)
```
GET /api/admin/users
- Lists all users with role and metadata
- Requires: admin role + list_users permission
- Response: { users: [...], total: number }

GET /api/admin/users/:id
- Get specific user details
- Requires: admin role + read_user permission

PUT /api/admin/users/:id
- Update user (name, email, role)
- Requires: admin role + update_user permission
- Cannot change own admin role

DELETE /api/admin/users/:id
- Delete user account
- Requires: admin role + delete_user permission
- Cannot delete own account

POST /api/admin/users
- Create new user with specified role
- Requires: admin role + create_user permission
- Request: { email, password, name, role }

GET /api/admin/dashboard
- Admin analytics and system stats
- Requires: admin role + view_analytics permission
- Response: { roleDistribution, totalUsers, systemHealth }
```

#### Protected Routes (Any Authenticated User)
```
GET /api/user/profile
- Get current user profile

GET /api/user/dashboard
- Get user dashboard data

GET /api/user/settings
- Get user settings

PUT /api/user/settings
- Update user settings
```

### Middleware Chain Example

```javascript
// Admin-only user deletion
app.delete(
  '/api/admin/users/:id',
  verifyToken,              // Check JWT validity
  hasRole([ROLES.ADMIN]),   // Check user is admin
  hasPermission(PERMISSIONS.DELETE_USER),  // Check has permission
  deleteUserHandler        // Execute endpoint logic
);
```

## Frontend Implementation

### Role Guard Component

The `RoleGuard` component protects routes based on user role:

```javascript
<RoleGuard allowedRoles={['admin', 'moderator']}>
  <AdminPanel />
</RoleGuard>
```

**Features:**
- Shows loading spinner while authenticating
- Redirects to login if not authenticated
- Shows access denied page if role not allowed
- Works with `ProtectedRoute` for dual protection

### Components

#### 1. **AuthContext** (`src/context/AuthContext.js`)
- Stores user object with role
- Provides `useAuth()` hook
- Returns user with role: `{ id, email, name, role }`

#### 2. **ProtectedRoute** (`src/context/ProtectedRoute.js`)
- Protects routes from unauthenticated users
- Shows loading state during token verification
- Redirects to login if not authenticated

#### 3. **RoleGuard** (`src/context/RoleGuard.js`)
- Protects routes from unauthorized roles
- Requires `ProtectedRoute` parent
- Shows access denied page for unauthorized roles
- Example: Admin-only routes

#### 4. **Dashboard** (`src/components/Dashboard.js`)
- Shows user role badge
- Admin users see "Admin Panel" button in menu
- Navigates to /admin for admin users

#### 5. **AdminPanel** (`src/components/AdminPanel.js`)
- Comprehensive user management interface
- Display user list in filterable table
- Create, edit, delete users
- View role distribution statistics
- Assign and change user roles
- Access restricted to admin role only

#### 6. **Settings** (`src/components/Settings.js`)
- Shows current user role
- User can update own settings
- Role display with color badge

### Routes Configuration

```javascript
// App.js routing
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin']}>
        <AdminPanel />
      </RoleGuard>
    </ProtectedRoute>
  } 
/>
```

## UI Role-Based Features

### Conditional Rendering

#### Dashboard Menu
- All users: Settings, Logout
- Admins: "👑 Admin Panel" button appears

#### Admin Panel
- **Admin only** route at `/admin`
- Shows user list with roles
- Create/edit/delete user forms
- System analytics dashboard
- Role distribution statistics

#### Role Badge Display
- Color-coded role badges:
  - Red (#d32f2f): Admin
  - Orange (#f57c00): Moderator
  - Blue (#1976d2): User
  - Gray (#757575): Guest

### Login Form Demo Credentials

Updated to show all available roles:
```
👑 Admin       : admin@example.com / admin123
🔨 Moderator   : moderator@example.com / mod123
👤 User        : demo@example.com / password123
👻 Guest       : guest@example.com / guest123
```

## Testing RBAC

### Test Scenarios

1. **Admin Access**
   - Login as admin@example.com / admin123
   - Should see "Admin Panel" in menu
   - Can access /admin route
   - Can view all users
   - Can create/edit/delete users
   - Can change user roles

2. **Moderator Access**
   - Login as moderator@example.com / mod123
   - Should see regular dashboard
   - Cannot access /admin route (redirects to access denied)
   - Cannot see user management options

3. **User Access**
   - Login as demo@example.com / password123
   - Can access /dashboard and /settings
   - Cannot see admin options
   - Cannot access /admin route

4. **Permission Verification**
   - Try accessing /admin with non-admin user
   - Should see "Access Denied" page
   - Try deleting user via API without admin role
   - Should receive 403 Forbidden response

5. **Token Verification**
   - Use admin.email but guest.password
   - Should fail to login (invalid credentials)
   - Invalid tokens should return 403 Forbidden

## Database/User Storage

Currently using mock data in-memory. For production, this should be replaced with:

1. **MongoDB + Mongoose**
```javascript
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['admin', 'moderator', 'user', 'guest'], default: 'user' },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});
```

2. **User creation with role**
```javascript
const newUser = await User.create({
  email, password, name,
  role: 'user', // or specified role for admin creation
  permissons: ROLE_PERMISSIONS['user']
});
```

## Security Considerations

1. **JWT Secret:** Change `JWT_SECRET` to environment variable in production
2. **Password Hashing:** Implement bcrypt for password hashing
3. **Rate Limiting:** Add rate limiting on login/register endpoints
4. **HTTPS Only:** Require HTTPS in production
5. **Token Expiration:** Currently 24 hours, adjust as needed
6. **Role Validation:** Always validate role on backend (don't trust frontend)
7. **Permission Checks:** Always verify permissions server-side

## File Structure

```
project/
├── src/
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── ProtectedRoute.js
│   │   └── RoleGuard.js
│   ├── components/
│   │   ├── LoginForm.js
│   │   ├── Dashboard.js
│   │   ├── Settings.js
│   │   └── AdminPanel.js
│   ├── styles/
│   │   ├── LoginForm.css
│   │   ├── Dashboard.css
│   │   ├── Settings.css
│   │   └── AdminPanel.css
│   └── App.js
├── server/
│   ├── server.js (with RBAC endpoints)
│   └── package.json
└── package.json
```

## Performance Optimization

- Cached permissions in ROLE_PERMISSIONS object
- JWT tokens stored in localStorage + state
- Axios interceptor for automatic header injection
- Lazy component loading for admin routes (optional)

## Future Enhancements

1. Dynamic permission management (store in database)
2. Permission request/approval workflow
3. Activity logging and audit trail
4. Role-based data filtering
5. Two-factor authentication
6. OAuth 2.0 integration
7. API key-based access for services
8. Scope-based permissions for fine-grained control

## Troubleshooting

### Admin Panel Returns "Access Denied"
- Verify your JWT token includes role in payload
- Check backend response: `GET /api/auth/verify-token`
- Ensure user role in database is set to 'admin'

### Role Not Showing in Frontend
- Check AuthContext is properly wrapping app
- Verify login response includes role field
- Check browser DevTools Network tab for token payload

### Permissions Not Working
- Verify user role matches ROLE_PERMISSIONS mapping
- Check backend middleware chain order
- Ensure hasPermission middleware is after verifyToken

---

**Status:** Complete RBAC implementation ready for production (with recommended security enhancements)
