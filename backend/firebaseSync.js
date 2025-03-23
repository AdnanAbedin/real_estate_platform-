const { admin } = require('./config/firebase');
const Banner = require('./models/Banner');
const Company = require('./models/Company');
const Property = require('./models/Property');
const WhatsAppInquiry = require('./models/WhatsAppInquiry');

// Function to sync Firebase data to PostgreSQL on startup
async function syncFirebaseToPostgres() {
  try {
    console.log('Starting Firebase to PostgreSQL sync...');

    // Sync Banners
    const bannersRef = admin.database().ref('banners');
    const bannersSnapshot = await bannersRef.once('value');
    const bannersData = bannersSnapshot.val() || {};
    for (const [id, banner] of Object.entries(bannersData)) {
      await Banner.upsert({
        id,
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetUrl: banner.targetUrl,
        placement: banner.placement,
        startDate: banner.startDate,
        endDate: banner.endDate,
        status: banner.status || 'active',
        createdAt: banner.createdAt ? new Date(banner.createdAt) : new Date(),
        updatedAt: banner.updatedAt ? new Date(banner.updatedAt) : new Date(),
        isDeleted: banner.isDeleted || false,
      });
    }
    console.log('Banners synced successfully');

    // Sync Companies
    const companiesRef = admin.database().ref('companies');
    const companiesSnapshot = await companiesRef.once('value');
    const companiesData = companiesSnapshot.val() || {};
    for (const [id, company] of Object.entries(companiesData)) {
      await Company.upsert({
        id,
        name: company.name,
        description: company.description,
        logo: company.logo,
        contactEmail: company.contactEmail,
        whatsappNumber: company.whatsappNumber,
        status: company.status || 'active',
        createdAt: company.createdAt ? new Date(company.createdAt) : new Date(),
        updatedAt: company.updatedAt ? new Date(company.updatedAt) : new Date(),
        isDeleted: company.isDeleted || false,
      });
    }
    console.log('Companies synced successfully');

    // Sync Properties
    const propertiesRef = admin.database().ref('properties');
    const propertiesSnapshot = await propertiesRef.once('value');
    const propertiesData = propertiesSnapshot.val() || {};
    for (const [id, property] of Object.entries(propertiesData)) {
      await Property.upsert({
        id,
        title: property.title,
        description: property.description,
        price: parseFloat(property.price),
        location: property.location,
        companyId: property.companyId,
        tier: property.tier || 'standard',
        status: property.status || 'active',
        imageUrl: property.imageUrl,
        createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
        updatedAt: property.updatedAt ? new Date(property.updatedAt) : new Date(),
        isDeleted: property.isDeleted || false,
      });
    }
    console.log('Properties synced successfully');

    // Sync WhatsApp Inquiries
    const whatsappRef = admin.database().ref('whatsapp_inquiries');
    const whatsappSnapshot = await whatsappRef.once('value');
    const whatsappData = whatsappSnapshot.val() || {};
    for (const [id, inquiry] of Object.entries(whatsappData)) {
      await WhatsAppInquiry.upsert({
        id,
        propertyId: inquiry.propertyId,
        companyId: inquiry.companyId,
        customerPhone: inquiry.customerPhone,
        message: inquiry.message,
        responseTime: inquiry.responseTime,
        status: inquiry.status || 'pending',
        createdAt: inquiry.createdAt ? new Date(inquiry.createdAt) : new Date(),
        updatedAt: inquiry.updatedAt ? new Date(inquiry.updatedAt) : new Date(),
        agentId: inquiry.agentId || null,
        responseMessage: inquiry.responseMessage || null,
        respondedAt: inquiry.respondedAt ? new Date(inquiry.respondedAt) : null,
        isDeleted: inquiry.isDeleted || false,
      });
    }
    console.log('WhatsApp Inquiries synced successfully');

  } catch (error) {
    console.error('Error syncing Firebase to PostgreSQL:', error);
  }
}

// Function to listen for Firebase changes and sync to PostgreSQL
function setupFirebaseListeners() {
  // Listener for Banners
  admin.database().ref('banners').on('child_changed', async (snapshot) => {
    const banner = snapshot.val();
    try {
      await Banner.upsert({
        id: snapshot.key,
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetUrl: banner.targetUrl,
        placement: banner.placement,
        startDate: banner.startDate,
        endDate: banner.endDate,
        status: banner.status,
        createdAt: banner.createdAt ? new Date(banner.createdAt) : new Date(),
        updatedAt: banner.updatedAt ? new Date(banner.updatedAt) : new Date(),
        isDeleted: banner.isDeleted || false,
      });
      console.log(`Banner ${snapshot.key} synced from Firebase to PostgreSQL`);
    } catch (error) {
      console.error(`Error syncing banner ${snapshot.key}:`, error);
    }
  });

  // Listener for Companies
  admin.database().ref('companies').on('child_changed', async (snapshot) => {
    const company = snapshot.val();
    try {
      await Company.upsert({
        id: snapshot.key,
        name: company.name,
        description: company.description,
        logo: company.logo,
        contactEmail: company.contactEmail,
        whatsappNumber: company.whatsappNumber,
        status: company.status,
        createdAt: company.createdAt ? new Date(company.createdAt) : new Date(),
        updatedAt: company.updatedAt ? new Date(company.updatedAt) : new Date(),
        isDeleted: company.isDeleted || false,
      });
      console.log(`Company ${snapshot.key} synced from Firebase to PostgreSQL`);
    } catch (error) {
      console.error(`Error syncing company ${snapshot.key}:`, error);
    }
  });

  // Listener for Properties
  admin.database().ref('properties').on('child_changed', async (snapshot) => {
    const property = snapshot.val();
    try {
      await Property.upsert({
        id: snapshot.key,
        title: property.title,
        description: property.description,
        price: parseFloat(property.price),
        location: property.location,
        companyId: property.companyId,
        tier: property.tier,
        status: property.status,
        imageUrl: property.imageUrl,
        createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
        updatedAt: property.updatedAt ? new Date(property.updatedAt) : new Date(),
        isDeleted: property.isDeleted || false,
      });
      console.log(`Property ${snapshot.key} synced from Firebase to PostgreSQL`);
    } catch (error) {
      console.error(`Error syncing property ${snapshot.key}:`, error);
    }
  });

  // Listener for WhatsApp Inquiries
  admin.database().ref('whatsapp_inquiries').on('child_changed', async (snapshot) => {
    const inquiry = snapshot.val();
    try {
      await WhatsAppInquiry.upsert({
        id: snapshot.key,
        propertyId: inquiry.propertyId,
        companyId: inquiry.companyId,
        customerPhone: inquiry.customerPhone,
        message: inquiry.message,
        responseTime: inquiry.responseTime,
        status: inquiry.status,
        createdAt: inquiry.createdAt ? new Date(inquiry.createdAt) : new Date(),
        updatedAt: inquiry.updatedAt ? new Date(inquiry.updatedAt) : new Date(),
        agentId: inquiry.agentId || null,
        responseMessage: inquiry.responseMessage || null,
        respondedAt: inquiry.respondedAt ? new Date(inquiry.respondedAt) : null,
        isDeleted: inquiry.isDeleted || false,
      });
      console.log(`WhatsApp Inquiry ${snapshot.key} synced from Firebase to PostgreSQL`);
    } catch (error) {
      console.error(`Error syncing whatsapp inquiry ${snapshot.key}:`, error);
    }
  });

  console.log('Firebase listeners set up successfully');
}

module.exports = { syncFirebaseToPostgres, setupFirebaseListeners };