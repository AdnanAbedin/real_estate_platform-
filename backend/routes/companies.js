const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

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

router.post('/', async (req, res) => {
  try {
    const { name, description, logo, contactEmail, whatsappNumber } = req.body;
    if (!name || !contactEmail) {
      return res.status(400).json({ error: 'name and contactEmail are required' });
    }
    const company = await Company.create({
      name,
      description,
      logo,
      contactEmail,
      whatsappNumber,
    });
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

module.exports = router;