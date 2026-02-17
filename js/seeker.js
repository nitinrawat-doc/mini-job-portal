// ==========================================
// Job Seeker Dashboard Logic
// ==========================================

let currentUser = null;
let allJobs = [];
let filteredJobs = [];
let userApplications = new Set();
let selectedJobId = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const searchInput = document.getElementById('searchInput');
const locationFilter = document.getElementById('locationFilter');
const jobsList = document.getElementById('jobsList');
const emptyState = document.getElementById('emptyState');
const loadingOverlay = document.getElementById('loadingOverlay');
const totalJobs = document.getElementById('totalJobs');
const myApplications = document.getElementById('myApplications');
const jobCount = document.getElementById('jobCount');

// Job Details Modal
const jobDetailsModal = document.getElementById('jobDetailsModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalJobTitle = document.getElementById('modalJobTitle');
const modalCompany = document.getElementById('modalCompany');
const modalLocation = document.getElementById('modalLocation');
const modalSalary = document.getElementById('modalSalary');
const modalDescription = document.getElementById('modalDescription');
const modalPosted = document.getElementById('modalPosted');
const applyBtn = document.getElementById('applyBtn');
const appliedBtn = document.getElementById('appliedBtn');

// Toast notification
const successToast = document.getElementById('successToast');
const toastMessage = document.getElementById('toastMessage');

// ==========================================
// Authentication Check
// ==========================================

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // User not logged in, redirect to login
    window.location.href = 'index.html';
    return;
  }

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();

    // Check if user is a job seeker
    if (userData.role !== 'seeker') {
      window.location.href = 'dashboard-recruiter.html';
      return;
    }

    // Set current user
    currentUser = {
      uid: user.uid,
      email: user.email,
      name: userData.name
    };

    // Display user name
    userName.textContent = userData.name;

    // Load dashboard data
    await loadUserApplications();
    await loadJobs();
    await loadStats();

  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Error loading profile. Please try logging in again.');
    await auth.signOut();
    window.location.href = 'index.html';
  }
});

// ==========================================
// Logout Handler
// ==========================================

logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out. Please try again.');
  }
});

// ==========================================
// Load User Applications
// ==========================================

async function loadUserApplications() {
  if (!currentUser) return;

  try {
    const snapshot = await db.collection('applications')
      .where('candidateId', '==', currentUser.uid)
      .get();

    userApplications.clear();
    snapshot.forEach(doc => {
      const app = doc.data();
      userApplications.add(app.jobId);
    });

  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

// ==========================================
// Load Jobs
// ==========================================

async function loadJobs() {
  showLoading(true);

  try {
    // Get all jobs
    const snapshot = await db.collection('jobs')
      .orderBy('postedAt', 'desc')
      .get();

    allJobs = [];
    const locations = new Set();

    snapshot.forEach((doc) => {
      const job = {
        id: doc.id,
        ...doc.data()
      };
      allJobs.push(job);
      locations.add(job.location);
    });

    // Populate location filter
    populateLocationFilter(Array.from(locations).sort());

    // Initial display
    filteredJobs = [...allJobs];
    displayJobs(filteredJobs);

  } catch (error) {
    console.error('Error loading jobs:', error);
    alert('Error loading jobs. Please refresh the page.');
  } finally {
    showLoading(false);
  }
}

// ==========================================
// Populate Location Filter
// ==========================================

function populateLocationFilter(locations) {
  // Clear existing options except "All Locations"
  locationFilter.innerHTML = '<option value="">All Locations</option>';

  locations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationFilter.appendChild(option);
  });
}

// ==========================================
// Display Jobs
// ==========================================

function displayJobs(jobs) {
  jobsList.innerHTML = '';
  jobCount.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

  if (jobs.length === 0) {
    emptyState.classList.remove('hidden');
    jobsList.style.display = 'none';
  } else {
    emptyState.classList.add('hidden');
    jobsList.style.display = 'grid';

    jobs.forEach((job, index) => {
      const jobCard = createJobCard(job, index);
      jobsList.appendChild(jobCard);
    });
  }
}

// ==========================================
// Create Job Card
// ==========================================

function createJobCard(job, index) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.style.animationDelay = `${index * 0.05}s`;

  // Format date
  const postedDate = job.postedAt ?
    new Date(job.postedAt.toDate()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Just now';

  const hasApplied = userApplications.has(job.id);

  card.innerHTML = `
    <div class="job-card-header">
      <div>
        <h3 class="job-title">${escapeHtml(job.title)}</h3>
        <p class="company-name">${escapeHtml(job.company)}</p>
      </div>
      ${hasApplied ? '<span class="applicant-count" style="background: var(--success-color);">Applied</span>' : ''}
    </div>
    
    <div class="job-meta">
      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>${escapeHtml(job.location)}</span>
      </div>
      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span>${escapeHtml(job.salary)}</span>
      </div>
    </div>
    
    <p class="job-description-preview">${escapeHtml(job.description)}</p>
    
    <div class="job-footer">
      <span class="job-posted">Posted ${postedDate}</span>
      <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
        View Details
      </button>
    </div>
  `;

  // Add click handler
  card.addEventListener('click', () => {
    showJobDetails(job);
  });

  return card;
}

// ==========================================
// Show Job Details Modal
// ==========================================

function showJobDetails(job) {
  selectedJobId = job.id;
  
  modalJobTitle.textContent = job.title;
  modalCompany.textContent = job.company;
  modalLocation.textContent = job.location;
  modalSalary.textContent = job.salary;
  modalDescription.textContent = job.description;

  // Format posted date
  const postedDate = job.postedAt ?
    new Date(job.postedAt.toDate()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) : 'Just now';

  modalPosted.textContent = `Posted on ${postedDate}`;

  // Check if already applied
  const hasApplied = userApplications.has(job.id);

  if (hasApplied) {
    applyBtn.classList.add('hidden');
    appliedBtn.classList.remove('hidden');
  } else {
    applyBtn.classList.remove('hidden');
    appliedBtn.classList.add('hidden');
  }

  jobDetailsModal.classList.remove('hidden');
}

// ==========================================
// Modal Controls
// ==========================================

closeModal.addEventListener('click', () => {
  jobDetailsModal.classList.add('hidden');
});

closeModalBtn.addEventListener('click', () => {
  jobDetailsModal.classList.add('hidden');
});

modalOverlay.addEventListener('click', () => {
  jobDetailsModal.classList.add('hidden');
});

// Prevent modal close when clicking inside modal content
document.querySelectorAll('.modal-content').forEach(content => {
  content.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

// ==========================================
// Apply for Job
// ==========================================

applyBtn.addEventListener('click', async () => {
  if (!currentUser || !selectedJobId) {
    alert('Error: Unable to submit application');
    return;
  }

  // Check if already applied
  if (userApplications.has(selectedJobId)) {
    showToast('You have already applied to this job');
    return;
  }

  showLoading(true);

  try {
    // Get job details
    const jobDoc = await db.collection('jobs').doc(selectedJobId).get();
    
    if (!jobDoc.exists) {
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data();

    // Create application
    const applicationData = {
      jobId: selectedJobId,
      jobTitle: jobData.title,
      candidateId: currentUser.uid,
      candidateEmail: currentUser.email,
      recruiterId: jobData.recruiterId,
      appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    await db.collection('applications').add(applicationData);

    // Update local applications set
    userApplications.add(selectedJobId);

    // Update UI
    applyBtn.classList.add('hidden');
    appliedBtn.classList.remove('hidden');

    // Close modal and show success
    jobDetailsModal.classList.add('hidden');
    showToast('Application submitted successfully!');

    // Reload jobs to update UI
    displayJobs(filteredJobs);
    await loadStats();

  } catch (error) {
    console.error('Error applying for job:', error);
    alert('Error submitting application. Please try again.');
  } finally {
    showLoading(false);
  }
});

// ==========================================
// Search Jobs
// ==========================================

searchInput.addEventListener('input', (e) => {
  filterJobs();
});

// ==========================================
// Filter Jobs by Location
// ==========================================

locationFilter.addEventListener('change', () => {
  filterJobs();
});

// ==========================================
// Filter Jobs Function
// ==========================================

function filterJobs() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedLocation = locationFilter.value;

  filteredJobs = allJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm);

    const matchesLocation = !selectedLocation || 
      job.location === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  displayJobs(filteredJobs);
}

// ==========================================
// Load Statistics
// ==========================================

async function loadStats() {
  try {
    // Count total jobs
    const jobsSnapshot = await db.collection('jobs').get();
    totalJobs.textContent = jobsSnapshot.size;

    // Count user's applications
    if (currentUser) {
      const applicationsSnapshot = await db.collection('applications')
        .where('candidateId', '==', currentUser.uid)
        .get();

      myApplications.textContent = applicationsSnapshot.size;
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ==========================================
// Show Toast Notification
// ==========================================

function showToast(message) {
  toastMessage.textContent = message;
  successToast.classList.remove('hidden');

  setTimeout(() => {
    successToast.classList.add('hidden');
  }, 3000);
}

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

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ==========================================
// Real-time Updates (Optional)
// ==========================================

// Listen for new jobs in real-time
db.collection('jobs')
  .orderBy('postedAt', 'desc')
  .onSnapshot((snapshot) => {
    // Only update if we have a current user
    if (currentUser) {
      loadJobs();
      loadStats();
    }
  }, (error) => {
    console.error('Error listening to jobs:', error);
  });
