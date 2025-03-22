// backend/routes/properties.js
const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { Sequelize } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { bucket } = require('../config/firebase');

// Configure multer with disk storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper function to upload to Firebase
async function uploadToFirebase(file) {
  try {
    if (!file || !file.path) {
      throw new Error('No file path provided');
    }

    const fileName = `properties/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    console.log('Uploading file to Firebase:', fileName);
    console.log('Target bucket:', bucket.name);

    const fileBuffer = await fs.readFile(file.path);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
      public: true, // Make the file public
    });

    // Use the public URL instead of a signed URL
    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('File uploaded successfully, URL:', url);

    await fs.unlink(file.path).catch(err => console.error('Failed to delete local file:', err));
    return url;
  } catch (error) {
    console.error('Firebase upload failed:', error);
    throw new Error('Failed to upload image to Firebase: ' + error.message);
  }
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, location, companyId, tier, status } = req.body;

    console.log('Request body:', req.body);
    console.log('File received:', req.file);

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    } else {
      console.log('No image file provided');
    }

    const property = await Property.create({
      title,
      description,
      price: parseFloat(price),
      location,
      companyId,
      tier: tier || 'standard',
      status: status || 'active',
      imageUrl,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      error: 'Failed to create property',
      details: error.message,
    });
  }
});

// Other routes remain unchanged
router.get('/', async (req, res) => {
  const { companyId, search } = req.query;
  const where = { isDeleted: false };

  if (companyId) where.companyId = companyId;
  if (search) {
    where[Sequelize.Op.or] = [
      { title: { [Sequelize.Op.iLike]: `%${search}%` } },
      { location: { [Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }

  try {
    const properties = await Property.findAll({
      where,
      order: [['tier', 'DESC']],
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    let imageUrl = property.imageUrl;
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    }

    const updateData = {
      ...req.body,
      price: parseFloat(req.body.price),
      imageUrl,
    };

    await property.update(updateData);
    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    await property.update({ isDeleted: true });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property', details: error.message });
  }
});

module.exports = router;