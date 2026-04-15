import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROLE & PERMISSION DEFINITIONS
// ============================================

// Define roles
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
};

// Define permissions mapped to roles
const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  LIST_USERS: 'list_users',

  // Settings Management
  UPDATE_SETTINGS: 'update_settings',
  READ_SETTINGS: 'read_settings',

  // Content Management
  CREATE_CONTENT: 'create_content',
  READ_CONTENT: 'read_content',
  UPDATE_CONTENT: 'update_content',
  DELETE_CONTENT: 'delete_content',

  // Admin Access
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.LIST_USERS,
    PERMISSIONS.UPDATE_SETTINGS,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.LIST_USERS,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.USER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
    PERMISSIONS.READ_CONTENT,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.READ_CONTENT,
  ],
};

// Mock user database with roles
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: 2,
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    role: ROLES.USER,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
  },
  {
    id: 3,
    email: 'moderator@example.com',
    password: 'mod123',
    name: 'Moderator User',
    role: ROLES.MODERATOR,
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date(),
  },
  {
    id: 4,
    email: 'guest@example.com',
    password: 'guest123',
    name: 'Guest User',
    role: ROLES.GUEST,
    createdAt: new Date('2024-03-01'),
    lastLogin: new Date(),
  },
];

// ============================================
// MIDDLEWARE FOR AUTHENTICATION & AUTHORIZATION
// ============================================

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

// Middleware to check if user has specific role
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
      });
    }

    next();
  };
};

// Middleware to check if user has specific permission
const hasPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    const permissionsArray = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    const hasRequired = permissionsArray.some(perm => userPermissions.includes(perm));

    if (!hasRequired) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${permissionsArray.join(', ')}`,
      });
    }

    next();
  };
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Generate JWT token (expires in 24 hours)
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

/**
 * POST /api/auth/register
 * Registers a new user
 */
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required',
    });
  }

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
  }

  // Create new user (default role is USER)
  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
    role: ROLES.USER, // Default role for new registrations
    createdAt: new Date(),
    lastLogin: new Date(),
  };
  users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  });
});

/**
 * POST /api/auth/verify-token
 * Verifies if a token is valid
 */
app.post('/api/auth/verify-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
});

// ============================================
// PROTECTED ROUTES (Require JWT token)
// ============================================

/**
 * GET /api/user/profile
 * Get current user profile (protected)
 */
app.get('/api/user/profile', verifyToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

/**
 * GET /api/user/dashboard
 * Get user dashboard data (protected)
 */
app.get('/api/user/dashboard', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to dashboard',
    data: {
      userId: req.user.id,
      userName: req.user.name,
      email: req.user.email,
      lastLogin: new Date().toISOString(),
      permissions: ['read', 'write'],
      loginCount: Math.floor(Math.random() * 100) + 1,
    },
  });
});

/**
 * GET /api/user/settings
 * Get user settings (protected)
 */
app.get('/api/user/settings', verifyToken, (req, res) => {
  res.json({
    success: true,
    settings: {
      language: 'en',
      theme: 'light',
      notifications: true,
      twoFA: false,
      emailUpdates: true,
    },
  });
});

/**
 * PUT /api/user/settings
 * Update user settings (protected)
 */
app.put('/api/user/settings', verifyToken, (req, res) => {
  const { language, theme, notifications, emailUpdates } = req.body;

  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: {
      language: language || 'en',
      theme: theme || 'light',
      notifications: notifications !== undefined ? notifications : true,
      twoFA: false,
      emailUpdates: emailUpdates !== undefined ? emailUpdates : true,
    },
  });
});

/**
 * POST /api/auth/logout
 * Logout user (protected)
 */
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================
// ADMIN ROUTES (Role-based)
// ============================================

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
app.get('/api/admin/users', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.LIST_USERS), (req, res) => {
  const userList = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  }));

  res.json({
    success: true,
    message: 'User list retrieved successfully',
    users: userList,
    total: userList.length,
  });
});

/**
 * GET /api/admin/users/:id
 * Get user details (admin only)
 */
app.get('/api/admin/users/:id', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.READ_USER), (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

/**
 * PUT /api/admin/users/:id
 * Update user (admin only)
 */
app.put('/api/admin/users/:id', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.UPDATE_USER), (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const { name, role, email } = req.body;

  // Validation
  if (role && !Object.values(ROLES).includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
    });
  }

  // Update user
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  res.json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
app.delete('/api/admin/users/:id', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.DELETE_USER), (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent admin from deleting themselves
  if (req.user.id === userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account',
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    success: true,
    message: 'User deleted successfully',
    user: {
      id: deletedUser.id,
      email: deletedUser.email,
      name: deletedUser.name,
    },
  });
});

/**
 * POST /api/admin/users
 * Create new user (admin only)
 */
app.post('/api/admin/users', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.CREATE_USER), (req, res) => {
  const { email, password, name, role } = req.body;

  // Validation
  if (!email || !password || !name || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, name, and role are required',
    });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
    });
  }

  // Check if user already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
    role,
    createdAt: new Date(),
    lastLogin: null,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  });
});

/**
 * GET /api/admin/dashboard
 * Admin dashboard analytics (admin only)
 */
app.get('/api/admin/dashboard', verifyToken, hasRole([ROLES.ADMIN]), hasPermission(PERMISSIONS.VIEW_ANALYTICS), (req, res) => {
  const roleStats = {
    [ROLES.ADMIN]: users.filter(u => u.role === ROLES.ADMIN).length,
    [ROLES.MODERATOR]: users.filter(u => u.role === ROLES.MODERATOR).length,
    [ROLES.USER]: users.filter(u => u.role === ROLES.USER).length,
    [ROLES.GUEST]: users.filter(u => u.role === ROLES.GUEST).length,
  };

  res.json({
    success: true,
    message: 'Admin dashboard data',
    data: {
      totalUsers: users.length,
      roleDistribution: roleStats,
      systemHealth: {
        apiStatus: 'operational',
        uptime: Math.floor(process.uptime() / 60) + ' minutes',
        timestamp: new Date().toISOString(),
      },
    },
  });
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Authentication Server Running        ║
║   Port: ${PORT}                         ║
║   URL: http://localhost:${PORT}        ║
╚════════════════════════════════════════╝

Available Endpoints:
  PUBLIC:
    POST   /api/auth/login
    POST   /api/auth/register
    POST   /api/auth/verify-token
    GET    /api/health

  PROTECTED (Require JWT):
    GET    /api/user/profile
    GET    /api/user/dashboard
    GET    /api/user/settings
    PUT    /api/user/settings
    POST   /api/auth/logout

  ADMIN ENDPOINTS (Admin Only):
    GET    /api/admin/users
    GET    /api/admin/users/:id
    POST   /api/admin/users
    PUT    /api/admin/users/:id
    DELETE /api/admin/users/:id
    GET    /api/admin/dashboard

Demo Credentials (RBAC Roles):
  👑 Admin:     admin@example.com / admin123
  🔨 Moderator: moderator@example.com / mod123
  👤 User:      demo@example.com / password123
  👻 Guest:     guest@example.com / guest123
  `);
});
