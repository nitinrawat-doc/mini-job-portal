// ==========================================
// Authentication Logic - FIXED VERSION
// ==========================================

// DOM Elements
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

const loadingOverlay = document.getElementById('loadingOverlay');

// ==========================================
// Toggle between Login and Register
// ==========================================

showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.classList.add('hidden');
  registerCard.classList.remove('hidden');
  loginError.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  registerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  registerError.textContent = '';
});

// ==========================================
// Login Handler
// ==========================================

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Clear previous errors
  loginError.textContent = '';
  
  // Validate inputs
  if (!email || !password) {
    loginError.textContent = 'Please fill in all fields';
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Sign in with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    
    // Redirect to seeker dashboard (only seeker role now)
    if (userData.role === 'seeker') {
      window.location.href = 'dashboard-seeker.html';
    } else {
      throw new Error('Invalid user role');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showLoading(false);
    
    // Display user-friendly error messages
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    loginError.textContent = errorMessage;
  }
});

// ==========================================
// Register Handler
// ==========================================

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const role = 'seeker'; // Always seeker now
  
  // Clear previous errors
  registerError.textContent = '';
  
  // Validate inputs
  if (!name || !email || !password) {
    registerError.textContent = 'Please fill in all fields';
    return;
  }
  
  if (password.length < 6) {
    registerError.textContent = 'Password must be at least 6 characters';
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Create user account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update display name
    await user.updateProfile({
      displayName: name
    });
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      role: role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Redirect to job seeker dashboard
    window.location.href = 'dashboard-seeker.html';
    
  } catch (error) {
    console.error('Registration error:', error);
    showLoading(false);
    
    // Display user-friendly error messages
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Registration is currently disabled';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    registerError.textContent = errorMessage;
  }
});

// ==========================================
// Check if user is already logged in
// ==========================================

auth.onAuthStateChanged(async (user) => {
  if (user) {
    showLoading(true);
    
    try {
      // Get user data
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Redirect to seeker dashboard (only seeker role now)
        if (userData.role === 'seeker') {
          window.location.href = 'dashboard-seeker.html';
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      showLoading(false);
    }
  } else {
    // User is not logged in, show login form
    showLoading(false);
  }
});

// ==========================================
// Utility Functions
// ==========================================

function showLoading(show) {
  if (show) {
    loadingOverlay.classList.remove('hidden');
  } else {
    loadingOverlay.classList.add('hidden');
  }
}

// ==========================================
// Email validation helper
// ==========================================

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}