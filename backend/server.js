// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const bannerRoutes = require('./routes/banners');
const companyRoutes = require('./routes/companies');
const propertyRoutes = require('./routes/properties');
const whatsappRoutes = require('./routes/whatsapp');

dotenv.config();
const app = express();

console.log('Starting server...');
console.log('Sequelize instance:', sequelize);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/banners', bannerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/uploads', express.static('uploads'));

// Database sync
sequelize.sync({ force: false })
  .then(() => console.log('Database synced successfully'))
  .catch(err => console.error('Failed to sync database:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});