import admin from 'firebase-admin';

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://real-state-d89c0-default-rtdb.firebaseio.com/', // Replace with your Firebase URL
});

const db = admin.firestore();
export default db;