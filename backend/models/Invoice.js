const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: String,
    required: true,
    default: 'Unknown Vendor'
  },
  invoiceNumber: {
    type: String,
    default: 'N/A'
  },
  date: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  rawText: {
    type: String
  },
  uploadedFile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
