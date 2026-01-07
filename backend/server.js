const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Load config from .env
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Validate required env variables
if (!SECRET_KEY) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Import Models
const User = require('./models/User');
const Expense = require('./models/Expense');
const Site = require('./models/Site'); // নতুন মডেল

// JWT Middleware – এখানে ফেক টোকেন যোগ করা হলো
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // ডেভেলপমেন্টের জন্য ফেক টোকেন এলাউ করুন (এটা রিমুভ করবেন প্রোডাকশনে)
  if (token === 'dev-token-123') {
    req.user = { id: 'dev-admin-123', name: 'Admin Shahin', phone: '01711006879' };
    return next();
  }

  if (!token) return res.status(401).json({ message: 'টোকেন প্রয়োজন' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'অবৈধ টোকেন' });
    req.user = user;
    next();
  });
};

// ========== USER ROUTES ==========

// Register (Public - প্রথম ইউজার তৈরি করতে)
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'নাম, ফোন ও পাসওয়ার্ড আবশ্যক' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে' });
    }

    const user = new User({ name, phone, password });
    await user.save();

    console.log('New user registered:', { name, phone });
    res.status(201).json({ message: 'ইউজার সফলভাবে তৈরি হয়েছে' });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'এই ফোন নম্বর ইতিমধ্যে ব্যবহৃত' });
    }
    res.status(500).json({ message: 'সার্ভারে সমস্যা হয়েছে' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'ফোন ও পাসওয়ার্ড দিন' });
    }

    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'ভুল ফোন বা পাসওয়ার্ড' });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, name: user.name },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', user.name);
    res.json({ token, user: { name: user.name, phone: user.phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'লগইন করতে সমস্যা' });
  }
});

// ========== TEAMMEMBER ROUTES (Admin Only) ==========

// Add Teammate (Admin থেকে নতুন ইউজার তৈরি)
app.post('/api/teammates', authenticateToken, async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'নাম, ফোন ও পাসওয়ার্ড আবশ্যক' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'এই ফোন নম্বরে ইতিমধ্যে একাউন্ট আছে' });
    }

    const teammate = new User({ name, phone, password });
    await teammate.save();

    res.status(201).json({
      message: 'টিমমেট সফলভাবে যোগ হয়েছে',
      teammate: { name, phone }
    });
  } catch (err) {
    console.error('Teammate add error:', err);
    res.status(500).json({ message: 'টিমমেট যোগ করতে সমস্যা' });
  }
});

// Get All Teammates
app.get('/api/teammates', authenticateToken, async (req, res) => {
  try {
    const teammates = await User.find().select('name phone createdAt').sort({ createdAt: -1 });
    res.json(teammates);
  } catch (err) {
    console.error('Fetch teammates error:', err);
    res.status(500).json({ message: 'টিমমেট লোড করতে সমস্যা' });
  }
});

// ========== SITE ROUTES ==========

// Add New Site
app.post('/api/sites', authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'সাইটের নাম ও ঠিকানা আবশ্যক' });
    }

    const existing = await Site.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'এই নামে ইতিমধ্যে সাইট আছে' });
    }

    const site = new Site({ name, address });
    await site.save();

    res.status(201).json({
      message: 'সাইট সফলভাবে যোগ হয়েছে',
      site
    });
  } catch (err) {
    console.error('Site add error:', err);
    res.status(500).json({ message: 'সাইট যোগ করতে সমস্যা' });
  }
});

// Get All Sites
app.get('/api/sites', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.find().sort({ createdAt: -1 });
    res.json(sites);
  } catch (err) {
    console.error('Fetch sites error:', err);
    res.status(500).json({ message: 'সাইট লোড করতে সমস্যা' });
  }
});

// ========== EXPENSE ROUTES ==========

// Save Daily Expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { siteName, deposit, rows, lastRowCash, note, totals } = req.body;

    const expense = new Expense({
      userId: req.user.id,
      siteName,
      deposit: parseFloat(deposit) || 0,
      rows: rows.map(r => ({
        desc: r.desc || '',
        amt: parseFloat(r.amt) || 0,
        cash: parseFloat(r.cash) || 0
      })),
      lastRowCash: parseFloat(lastRowCash) || 0,
      note: note || '',
      totals: {
        totalAmt: Number(totals.totalAmt) || 0,
        grandTotalCash: Number(totals.grandTotalCash) || 0,
        totalDue: Number(totals.totalDue) || 0,
        duePaid: Number(totals.duePaid) || 0,
        grandTotalDue: Number(totals.grandTotalDue) || 0,
        balance: Number(totals.balance) || 0
      }
    });

    await expense.save();
    console.log('Expense saved by:', req.user.name, '| Site:', siteName);

    res.status(201).json({ message: 'দৈনিক খরচ সংরক্ষিত হয়েছে' });
  } catch (err) {
    console.error('Expense save error:', err);
    res.status(500).json({ message: 'খরচ সংরক্ষণে সমস্যা' });
  }
});

// Get All Expenses (Public - Summary এর জন্য)
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('userId', 'name')
      .sort({ date: -1 })
      .lean();

    res.json(expenses);
  } catch (err) {
    console.error('Fetch expenses error:', err);
    res.status(500).json({ message: 'ডাটা লোড করতে সমস্যা' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log('Available Routes:');
  console.log('  POST   /api/register');
  console.log('  POST   /api/login');
  console.log('  POST   /api/teammates  (protected)');
  console.log('  GET    /api/teammates   (protected)');
  console.log('  POST   /api/sites       (protected)');
  console.log('  GET    /api/sites       (protected)');
  console.log('  POST   /api/expenses    (protected)');
  console.log('  GET    /api/expenses    (public)');
});