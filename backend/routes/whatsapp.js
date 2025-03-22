const express = require('express');
const router = express.Router();
const { WhatsAppInquiry } = require('../models/WhatsAppInquiry');
const db = require('../config/firebase.js');

router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const inquiry = await WhatsAppInquiry.create(req.body, { transaction });
    await db.collection('whatsapp_inquiries').doc(inquiry.id).set(req.body);
    await transaction.commit();
    res.status(201).json(inquiry);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

router.get('/stats/:companyId', async (req, res) => {
  try {
    const inquiries = await WhatsAppInquiry.findAll({
      where: { companyId: req.params.companyId }
    });
    const avgResponseTime = inquiries.reduce((sum, i) => sum + (i.responseTime || 0), 0) / inquiries.length;
    res.json({ total: inquiries.length, avgResponseTime });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;