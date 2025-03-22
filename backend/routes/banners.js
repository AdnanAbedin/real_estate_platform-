// backend/routes/banners.js
const express = require('express');
const router = express.Router();
const { Banner } = require('../models/Banner');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      imageUrl: `/uploads/${req.file.filename}`
    };
    const banner = await Banner.create(bannerData);
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.findAll({ where: { status: 'active' } });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;