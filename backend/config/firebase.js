// import { initializeApp } from "firebase/app";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyBm0fum6kAl5kZs_7VSc3filGd2il6uSGw",
//   authDomain: "real-state-d89c0.firebaseapp.com",
//   databaseURL: "https://real-state-d89c0-default-rtdb.firebaseio.com"
//   projectId: "real-state-d89c0",
//   storageBucket: "real-state-d89c0.firebasestorage.app",
//   messagingSenderId: "566564834802",
//   appId: "1:566564834802:web:57ec50aa7dbbdc20236f6b",
//   measurementId: "G-4D78DXNDDH"
// };

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// export { storage };


// backend/config/firebase.js
const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "real-state-d89c0.firebasestorage.app",
});

const bucket = admin.storage().bucket();

module.exports = { bucket }; 