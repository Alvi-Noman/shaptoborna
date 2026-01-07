const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  siteName: {
    type: String,
    required: true
  },
  deposit: {
    type: Number,
    required: true,
    default: 0
  },
  rows: [{
    desc: { type: String, default: '' },
    amt: { type: Number, default: 0 },
    cash: { type: Number, default: 0 },
    due: { type: Number, default: 0 }
  }],
  lastRowCash: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    default: ''
  },
  totals: {
    totalAmt: Number,
    grandTotalCash: Number,
    totalDue: Number,
    duePaid: Number,
    grandTotalDue: Number,
    balance: Number
  }
}, { timestamps: true }); // এটি Actual Date (createdAt) হ্যান্ডেল করবে

// CORRECT pre-save hook — NO next() call!
expenseSchema.pre('save', async function () {
  // Automatically calculate row-level due if you want to save it
  this.rows = this.rows.map(row => ({
    ...row,
    due: (parseFloat(row.amt) || 0) - (parseFloat(row.cash) || 0)
  }));
});

module.exports = mongoose.model('Expense', expenseSchema);