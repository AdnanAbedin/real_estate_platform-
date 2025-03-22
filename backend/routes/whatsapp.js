
require('dotenv').config();
const express = require('express');
const router = express.Router();
const WhatsAppInquiry = require('../models/WhatsAppInquiry');
const { bucket } = require('../config/firebase');
const admin = require('firebase-admin');
const sequelize = require('../config/database'); // Ensure correct path to your Sequelize instance

router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Request body:', req.body); // Log the incoming request body for debugging

    const { propertyId, companyId, customerPhone, message } = req.body;

    // Explicit validation
    if (!propertyId) throw new Error('propertyId is required');
    if (!companyId) throw new Error('companyId is required');
    if (!customerPhone) throw new Error('customerPhone is required');
    if (!message) throw new Error('message is required');

    const inquiry = await WhatsAppInquiry.create({
      propertyId,
      companyId,
      customerPhone,
      message,
      status: 'pending',
    }, { transaction });

    // Sync with Firebase (we'll fix this next)
    await admin.database().ref('whatsapp_inquiries').child(inquiry.id).set({
      propertyId,
      companyId,
      customerPhone,
      message,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      status: 'pending',
    });

    await transaction.commit();
    console.log(`WhatsApp inquiry created: ${inquiry.id}`);
    res.status(201).json(inquiry);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating WhatsApp inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry', details: error.message });
  }
});

router.post('/:id/respond', async (req, res) => {
  try {
    const { responseMessage, agentId } = req.body;

    // Validation
    if (!responseMessage) {
      return res.status(400).json({ error: 'responseMessage is required' });
    }

    const inquiry = await WhatsAppInquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const respondedAt = new Date();
    const responseTime = Math.round((respondedAt - new Date(inquiry.createdAt)) / 1000); // in seconds

    // Handle agentId: allow null or empty string to be treated as null
    const updatedAgentId = agentId && agentId.trim() !== '' ? agentId : null;

    await inquiry.update({
      responseMessage,
      agentId: updatedAgentId,
      respondedAt,
      responseTime,
      status: 'responded',
    });

    // Update Firebase
    await admin.database().ref('whatsapp_inquiries').child(inquiry.id).update({
      responseMessage,
      agentId: updatedAgentId,
      respondedAt: respondedAt.toISOString(),
      responseTime,
      status: 'responded',
    });

    console.log(`WhatsApp inquiry responded: ${inquiry.id}`);
    res.json(inquiry);
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    res.status(500).json({ error: 'Failed to respond to inquiry', details: error.message });
  }
});

router.get('/stats/:companyId', async (req, res) => {
  try {
    const inquiries = await WhatsAppInquiry.findAll({
      where: { 
        companyId: req.params.companyId,
        status: 'responded',
      },
      attributes: ['id', 'responseTime'], // Explicitly list only columns that exist
    });

    const stats = {
      total: inquiries.length,
      avgResponseTime: inquiries.length 
        ? inquiries.reduce((sum, i) => sum + (i.responseTime || 0), 0) / inquiries.length 
        : 0,
      pending: await WhatsAppInquiry.count({
        where: { companyId: req.params.companyId, status: 'pending' },
      }),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching WhatsApp stats:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
