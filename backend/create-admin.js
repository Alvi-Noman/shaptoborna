// backend/create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ phone: 'AdminShahin' });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin Shahin',
      phone: 'AdminShahin',     // এটাই আপনার ইউজারনেম
      password: '01711006879'    // এটাই পাসওয়ার্ড
    });

    await admin.save();
    console.log('Admin created successfully!');
    console.log('Username: AdminShahin');
    console.log('Password: 01711006879');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();