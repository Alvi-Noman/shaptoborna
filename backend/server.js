const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Load config from .env
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

// Validate required env variables
if (!SECRET_KEY) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// ========== CORS CONFIGURATION ==========
const envOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...envOrigins
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

// Import Models
const User = require('./models/User');
const Expense = require('./models/Expense');
const Site = require('./models/Site'); 

// ========== JWT MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'টোকেন প্রয়োজন' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'অবৈধ টোকেন' });
    req.user = user;
    next();
  });
};

// ========== USER ROUTES ==========

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
    res.status(201).json({ message: 'ইউজার সফলভাবে তৈরি হয়েছে' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'সার্ভারে সমস্যা হয়েছে' });
  }
});

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
    res.json({ token, user: { name: user.name, phone: user.phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'লগইন করতে সমস্যা' });
  }
});

// ========== TEAMMEMBER ROUTES ==========

app.post('/api/teammates', authenticateToken, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const teammate = new User({ name, phone, password });
    await teammate.save();
    res.status(201).json({ message: 'টিমমেট সফলভাবে যোগ হয়েছে', teammate: { name, phone } });
  } catch (err) {
    res.status(500).json({ message: 'টিমমেট যোগ করতে সমস্যা' });
  }
});

app.get('/api/teammates', authenticateToken, async (req, res) => {
  try {
    const teammates = await User.find().select('name phone createdAt').sort({ createdAt: -1 });
    res.json(teammates);
  } catch (err) {
    res.status(500).json({ message: 'টিমমেট লোড করতে সমস্যা' });
  }
});

// ========== SITE ROUTES ==========

app.post('/api/sites', authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.body;
    const site = new Site({ name, address });
    await site.save();
    res.status(201).json({ message: 'সাইট সফলভাবে যোগ হয়েছে', site });
  } catch (err) {
    res.status(500).json({ message: 'সাইট যোগ করতে সমস্যা' });
  }
});

app.get('/api/sites', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.find().sort({ createdAt: -1 });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: 'সাইট লোড করতে সমস্যা' });
  }
});

// ========== EXPENSE ROUTES ==========

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // এখানে 'date' রিসিভ করা হচ্ছে যা ফ্রন্টএন্ড থেকে পাঠানো ইনপুট করা তারিখ
    const { date, siteName, deposit, rows, lastRowCash, note, totals } = req.body; 
    const expense = new Expense({
      userId: req.user.id,
      date: date, // Inputted Date সেভ করা হচ্ছে
      siteName,
      deposit: parseFloat(deposit) || 0,
      rows: rows.map(r => ({ desc: r.desc || '', amt: parseFloat(r.amt) || 0, cash: parseFloat(r.cash) || 0 })),
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
    res.status(201).json({ message: 'দৈনিক খরচ সংরক্ষিত হয়েছে' });
  } catch (err) {
    res.status(500).json({ message: 'খরচ সংরক্ষণে সমস্যা' });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('userId', 'name').sort({ date: -1 }).lean();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'ডাটা লোড করতে সমস্যা' });
  }
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});