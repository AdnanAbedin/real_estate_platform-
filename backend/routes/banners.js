// backend/routes/banners.js
const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const { uploadToFirebase } = require('./properties'); // Import named export

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, targetUrl, placement, startDate, endDate, status } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    } else {
      return res.status(400).json({ error: 'Banner image is required' });
    }

    const bannerData = {
      title,
      imageUrl,
      targetUrl,
      placement,
      startDate,
      endDate,
      status: status || 'active',
    };

    const banner = await Banner.create(bannerData);
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { placement } = req.query; // Allow filtering by placement
    const where = { status: 'active', isDeleted: false };
    if (placement) where.placement = placement;

    const banners = await Banner.findAll({ where });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    let imageUrl = banner.imageUrl;
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file); // Update image if provided
    }

    const updateData = {
      ...req.body,
      imageUrl,
    };

    await banner.update(updateData);
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    await banner.update({ isDeleted: true });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner', details: error.message });
  }
});

module.exports = router;