const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');

// Setup multer for temporary local storage
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage });

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Upload and Process Invoice
router.post('/upload', auth, upload.single('invoice'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  
  try {
    // 1. Send file to Python service for OCR
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const ocrResponse = await axios.post(`${PYTHON_SERVICE_URL}/process-invoice`, formData, {
        headers: {
            ...formData.getHeaders()
        }
    });

    const ocrData = ocrResponse.data;
    
    // 2. Send extracted text for Classification
    let category = 'Uncategorized';
    if (ocrData.rawText) {
        try {
            const classResponse = await axios.post(`${PYTHON_SERVICE_URL}/classify-text`, {
                text: ocrData.rawText
            });
            category = classResponse.data.category || category;
        } catch (clsErr) {
            console.error('Classification error:', clsErr.message);
        }
    }

    // 3. Save to MongoDB
    const newInvoice = new Invoice({
        userId: req.user.id,
        vendor: ocrData.vendor || 'Unknown Vendor',
        invoiceNumber: ocrData.invoice_number || 'N/A',
        date: ocrData.date || Date.now().toString(),
        amount: ocrData.total_amount ? parseFloat(ocrData.total_amount) : 0,
        category: category,
        rawText: ocrData.rawText,
        uploadedFile: req.file.filename
    });

    await newInvoice.save();

    res.status(201).json(newInvoice);

  } catch (error) {
    console.error('Error processing invoice:', error.message);
    res.status(500).json({ message: 'Failed to process invoice' });
  }
});

// Get all invoices for logged in user
router.get('/all', auth, async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching invoices' });
    }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching invoice' });
    }
});

module.exports = router;
