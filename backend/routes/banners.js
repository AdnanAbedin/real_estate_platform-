const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const { uploadToFirebase } = require('./properties');
const { admin } = require('../config/firebase'); 
const sequelize = require('../config/database'); 

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, targetUrl, placement, startDate, endDate, status } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    } else {
      await transaction.rollback();
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

    const banner = await Banner.create(bannerData, { transaction });

    // Sync with Firebase Realtime Database
    await admin.database().ref('banners').child(banner.id).set({
      ...bannerData,
      id: banner.id,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      isDeleted: false,
    });

    await transaction.commit();
    res.status(201).json(banner);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { placement } = req.query;
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
  const transaction = await sequelize.transaction();
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Banner not found' });
    }

    let imageUrl = banner.imageUrl;
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    }

    const updateData = {
      ...req.body,
      imageUrl,
      updatedAt: new Date(), 
    };

    await banner.update(updateData, { transaction });

    // Sync with Firebase Realtime Database
    await admin.database().ref('banners').child(banner.id).update({
      ...updateData,
      id: banner.id,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });

    await transaction.commit();
    res.json(banner);
  } catch (error) {
    await transaction.rollback();
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