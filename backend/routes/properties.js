// backend/routes/properties.js
const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { Sequelize } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp'); // Add sharp for image processing
const { bucket } = require('../config/firebase');

// Configure multer with disk storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper function to upload to Firebase with size reduction
async function uploadToFirebase(file) {
  try {
    if (!file || !file.path) {
      throw new Error('No file path provided');
    }

    const fileName = `properties/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    console.log('Uploading file to Firebase:', fileName);
    console.log('Target bucket:', bucket.name);

    // Read the original file
    const originalBuffer = await fs.readFile(file.path);

    // Use sharp to resize and compress the image
    const compressedBuffer = await sharp(originalBuffer)
      .resize({
        width: 800, // Resize to a reasonable width (adjust as needed)
        height: 800,
        fit: 'inside', // Maintain aspect ratio, fit within 800x800
        withoutEnlargement: true, // Don’t upscale smaller images
      })
      .png({ quality: 80 }) // Compress PNG (adjust quality as needed)
      .toBuffer();

    // Check the size (400KB = 400 * 1024 bytes)
    const maxSize = 400 * 1024; // 400KB in bytes
    if (compressedBuffer.length > maxSize) {
      console.warn('Compressed image still exceeds 400KB, further reducing quality');
      // Further reduce quality if still too large
      const furtherCompressedBuffer = await sharp(originalBuffer)
        .resize({
          width: 800,
          height: 800,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 50 }) // Lower quality to ensure size < 400KB
        .toBuffer();

      if (furtherCompressedBuffer.length > maxSize) {
        throw new Error('Unable to compress image below 400KB');
      }
      await fileUpload.save(furtherCompressedBuffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true,
      });
    } else {
      await fileUpload.save(compressedBuffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true,
      });
    }

    // Use the public URL
    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('File uploaded successfully, URL:', url);
    console.log('Uploaded file size:', compressedBuffer.length / 1024, 'KB');

    // Clean up local file
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


router.get('/', async (req, res) => {
  const { companyId, search, minPrice, maxPrice, tier } = req.query;
  const where = { isDeleted: false };

  if (companyId) where.companyId = companyId;
  if (minPrice) where.price = { [Sequelize.Op.gte]: minPrice };
  if (maxPrice) where.price = { [Sequelize.Op.lte]: maxPrice };
  if (tier) where.tier = tier;
  
  if (search) {
    where[Sequelize.Op.or] = [
      Sequelize.where(
        Sequelize.fn('to_tsvector', Sequelize.col('title')),
        Sequelize.fn('plainto_tsquery', search)
      ),
      Sequelize.where(
        Sequelize.fn('to_tsvector', Sequelize.col('location')),
        Sequelize.fn('plainto_tsquery', search)
      ),
    ];
  }

  try {
    const properties = await Property.findAll({
      where,
      order: [['tier', 'DESC'], ['price', 'ASC']],
      limit: 20, // Add pagination
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
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

module.exports = router; // Default export is the router
module.exports.uploadToFirebase = uploadToFirebase; // Named export for the function