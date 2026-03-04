// ========================================
// Firebase Configuration
// Replace with YOUR Firebase config
// ========================================

 const firebaseConfig = {
    apiKey: "AIzaSyA33L0eFCRNwvgDlS3aAaFW3gRZNntcjDA",
    authDomain: "job-portal-mini-68bad.firebaseapp.com",
    projectId: "job-portal-mini-68bad",
    storageBucket: "job-portal-mini-68bad.firebasestorage.app",
    messagingSenderId: "250444121575",
    appId: "1:250444121575:web:5c82426c954fdb2717a942"
  };


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase initialized successfully!");