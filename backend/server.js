const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const bannerRoutes = require('./routes/banners');
const companyRoutes = require('./routes/companies');
const propertyRoutes = require('./routes/properties');
const whatsappRoutes = require('./routes/whatsapp');
const { syncFirebaseToPostgres, setupFirebaseListeners } = require('./firebaseSync'); // Import sync functions

const app = express();

console.log('Starting server...');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/banners', bannerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5001;

// Start server and perform initial sync
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server API is running on http://localhost:${PORT}/api`);
  console.log(`Server is running on http://localhost:${PORT}/`);

  // Sync database schema and then perform Firebase sync
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    await syncFirebaseToPostgres(); // Initial sync from Firebase to PostgreSQL
    setupFirebaseListeners(); // Start listening for Firebase changes
  } catch (err) {
    console.error('Failed to sync database or Firebase:', err);
  }
});