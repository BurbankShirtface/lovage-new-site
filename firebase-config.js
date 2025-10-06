const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  // You'll get these values from Firebase Console
  apiKey: "AIzaSyCRGat3HayoWEsDq9KTmYCBQyURQeaU7bM",
  authDomain: "lovage-ab10e.firebaseapp.com",
  projectId: "lovage-ab10e",
  storageBucket: "lovage-ab10e.firebasestorage.app",
  messagingSenderId: "126728322743",
  appId: "1:126728322743:web:796c87c2d34ecc0c6cd732",
  measurementId: "G-XR6JTZWF53",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = { storage };
