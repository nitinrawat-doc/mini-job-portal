// ========================================
// Saved Jobs Management
// ========================================

// ========================================
// LOAD SAVED JOBS
// ========================================
async function loadSavedJobs() {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    const container = document.getElementById('savedJobsContainer');
    container.innerHTML = '<p>Loading your saved jobs...</p>';
    
    try {
        // Query saved jobs for current user
        const snapshot = await db.collection('savedJobs')
            .where('userId', '==', user.uid)
            .orderBy('savedAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <h2>No saved jobs yet!</h2>
                    <p>Start saving jobs from the <a href="dashboard.html">dashboard</a>.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        snapshot.forEach(doc => {
            const job = doc.data();
            const jobCard = createSavedJobCard(job, doc.id);
            container.appendChild(jobCard);
        });
        
    } catch (error) {
        console.error('Error loading saved jobs:', error);
        container.innerHTML = '<p>Error loading saved jobs. Please try again.</p>';
    }
}

// ========================================
// CREATE SAVED JOB CARD
// ========================================
function createSavedJobCard(job, docId) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    card.innerHTML = `
        <h3>${job.title}</h3>
        <p class="company">${job.company}</p>
        <p class="location">📍 ${job.location}</p>
        <p class="salary">💰 ${job.salary}</p>
        <p class="description">${job.description}</p>
        <div class="actions">
            <button class="btn-primary" style="background-color: #e74c3c;" onclick="removeSavedJob('${docId}')">
                🗑️ Remove
            </button>
            <a href="${job.url}" target="_blank" class="btn-primary">
                Apply →
            </a>
        </div>
    `;
    
    return card;
}

// ========================================
// REMOVE SAVED JOB
// ========================================
async function removeSavedJob(docId) {
    if (!confirm('Remove this job from saved?')) return;
    
    try {
        await db.collection('savedJobs').doc(docId).delete();
        showToast('Job removed from saved!');
        loadSavedJobs(); // Refresh the list
    } catch (error) {
        console.error('Error removing job:', error);
        showToast('Error removing job. Try again!');
    }
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// INITIALIZE
// ========================================
auth.onAuthStateChanged((user) => {
    if (user) {
        loadSavedJobs();
    } else {
        window.location.href = 'login.html';
    }
});