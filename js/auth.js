// ========================================
// Authentication Logic
// ========================================

// Check if user is logged in (for protected pages)
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'saved-jobs.html'];
    
    if (!user && protectedPages.includes(currentPage)) {
        // User not logged in, redirect to login
        window.location.href = 'login.html';
    }
    
    // Update nav links based on auth state
    updateNavigation(user);
});

// Update navigation based on user state
function updateNavigation(user) {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    if (user) {
        // User is logged in - show logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
    }
}

// ========================================
// SIGNUP
// ========================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        const errorDiv = document.getElementById('signupError');
        const successDiv = document.getElementById('signupSuccess');
        
        try {
            // Create user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Save user data to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Show success message
            successDiv.textContent = 'Account created! Redirecting...';
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }
    });
}

// ========================================
// LOGIN
// ========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const errorDiv = document.getElementById('loginError');
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
}

// ========================================
// LOGOUT
// ========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.signOut();
        window.location.href = 'index.html';
    });
}