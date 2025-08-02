
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection (using MongoDB Atlas or local)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/siege-sellify');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed, running in demo mode:', error.message);
    // Continue running without database for demo purposes
  }
};

connectDB();

// User schema
const userSchema = new mongoose.Schema({
  googleId: String,
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  picture: String,
  authType: { type: String, enum: ['google', 'local'], default: 'local' },
  purchaseHistory: [{
    productId: String,
    productName: String,
    price: Number,
    purchaseDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        user.authType = 'google';
        user.picture = profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    } else {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value,
        authType: 'google'
      });
      await user.save();
      return done(null, user);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Database check middleware
const checkDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ 
      success: false, 
      message: 'Database not available. Please set up MongoDB connection in environment variables.' 
    });
  }
  next();
};

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// Google OAuth routes
app.get('/auth/google', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.redirect('/login?error=database-not-available');
  }
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'demo-client-id') {
    return res.redirect('/login?error=google-not-configured');
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google-auth-failed' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// API routes
app.get('/api/auth-status', (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

app.get('/api/user', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      purchaseHistory: req.user.purchaseHistory
    }
  });
});

// Manual signup
app.post('/auth/signup', checkDatabase, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists with this email' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authType: 'local'
    });
    
    await user.save();
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.json({ success: false, message: 'Error creating account' });
  }
});

// Manual login
app.post('/auth/login', checkDatabase, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }
    
    // Login user
    req.login(user, (err) => {
      if (err) {
        return res.json({ success: false, message: 'Error logging in' });
      }
      res.json({ success: true, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, message: 'Error logging in' });
  }
});

app.post('/api/purchase', isAuthenticated, async (req, res) => {
  try {
    const { productId, productName, price } = req.body;
    
    req.user.purchaseHistory.push({
      productId,
      productName,
      price
    });
    
    await req.user.save();
    res.json({ success: true, message: 'Purchase recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error recording purchase' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
