const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { Sequelize } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { bucket, admin } = require('../config/firebase'); 
const sequelize = require('../config/database'); 


const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

async function uploadToFirebase(file) {
  try {
    if (!file || !file.path) {
      throw new Error('No file path provided');
    }

    const fileName = `properties/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const originalBuffer = await fs.readFile(file.path);
    const compressedBuffer = await sharp(originalBuffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ quality: 80 })
      .toBuffer();

    const maxSize = 400 * 1024;
    if (compressedBuffer.length > maxSize) {
      console.warn('Compressed image still exceeds 400KB, further reducing quality');
      const furtherCompressedBuffer = await sharp(originalBuffer)
        .resize({
          width: 800,
          height: 800,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 50 })
        .toBuffer();

      if (furtherCompressedBuffer.length > maxSize) {
        throw new Error('Unable to compress image below 400KB');
      }
      await fileUpload.save(furtherCompressedBuffer, {
        metadata: { contentType: file.mimetype },
        public: true,
      });
    } else {
      await fileUpload.save(compressedBuffer, {
        metadata: { contentType: file.mimetype },
        public: true,
      });
    }

    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    await fs.unlink(file.path).catch(err => console.error('Failed to delete local file:', err));
    return url;
  } catch (error) {
    console.error('Firebase upload failed:', error);
    throw new Error('Failed to upload image to Firebase: ' + error.message);
  }
}

router.post('/', upload.single('image'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, price, location, companyId, tier, status } = req.body;

    if (!companyId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'companyId is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToFirebase(req.file);
    }

    const propertyData = {
      title,
      description,
      price: parseFloat(price),
      location,
      companyId,
      tier: tier || 'standard',
      status: status || 'active',
      imageUrl,
    };

    const property = await Property.create(propertyData, { transaction });

    await admin.database().ref('properties').child(property.id).set({
      ...propertyData,
      id: property.id,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      isDeleted: false,
    });

    await transaction.commit();
    res.status(201).json(property);
  } catch (error) {
    await transaction.rollback();
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
      limit: 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      await transaction.rollback();
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
      updatedAt: new Date(), 
    };

    await property.update(updateData, { transaction });

    // Sync with Firebase Realtime Database
    await admin.database().ref('properties').child(property.id).update({
      ...updateData,
      id: property.id,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });

    await transaction.commit();
    res.json(property);
  } catch (error) {
    await transaction.rollback();
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

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findOne({
      where: {
        id: req.params.id,
        isDeleted: false, 
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({ error: 'Failed to fetch property', details: error.message });
  }
});

module.exports = router;
module.exports.uploadToFirebase = uploadToFirebase;