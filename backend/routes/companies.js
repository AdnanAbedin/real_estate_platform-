const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { admin } = require('../config/firebase'); 
const sequelize = require('../config/database'); 

router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description, logo, contactEmail, whatsappNumber } = req.body;
    if (!name || !contactEmail) {
      await transaction.rollback();
      return res.status(400).json({ error: 'name and contactEmail are required' });
    }

    const companyData = {
      name,
      description,
      logo,
      contactEmail,
      whatsappNumber,
    };

    const company = await Company.create(companyData, { transaction });

    // Sync with Firebase Realtime Database
    await admin.database().ref('companies').child(company.id).set({
      ...companyData,
      id: company.id,
      status: 'active',
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      isDeleted: false,
    });

    await transaction.commit();
    res.status(201).json(company);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Company not found' });
    }

    const { name, description, logo, contactEmail, whatsappNumber } = req.body;
    
    // Validation
    if (!name || !contactEmail) {
      await transaction.rollback();
      return res.status(400).json({ error: 'name and contactEmail are required' });
    }

    const updateData = {
      name,
      description: description || null,
      logo: logo || null,
      contactEmail,
      whatsappNumber: whatsappNumber || null,
      updatedAt: new Date(),
    };

    await company.update(updateData, { transaction });

    // Sync with Firebase Realtime Database
    await admin.database().ref('companies').child(company.id).update({
      name,
      description: description || null,
      logo: logo || null,
      contactEmail,
      whatsappNumber: whatsappNumber || null,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });

    await transaction.commit();
    res.json(company);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll({ where: { status: 'active', isDeleted: false } });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;