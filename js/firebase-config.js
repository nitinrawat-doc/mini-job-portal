// ==========================================
// Firebase Configuration
// ==========================================

// IMPORTANT: Replace these values with your actual Firebase config
// Get this from Firebase Console > Project Settings > Your apps > Web app

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0KFwBsRKYNS-Qu9jXvkqhgAXmKbOnQ_I",
  authDomain: "mini-job-portal-fef9e.firebaseapp.com",
  projectId: "mini-job-portal-fef9e",
  storageBucket: "mini-job-portal-fef9e.firebasestorage.app",
  messagingSenderId: "938865435520",
  appId: "1:938865435520:web:acb34fbe6393077acc1765",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;

console.log("Firebase initialized successfully");
