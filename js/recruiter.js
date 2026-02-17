// ==========================================
// Recruiter Dashboard Logic
// ==========================================

let currentUser = null;
let currentJobId = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const newJobBtn = document.getElementById('newJobBtn');
const jobModal = document.getElementById('jobModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const jobForm = document.getElementById('jobForm');
const jobsList = document.getElementById('jobsList');
const emptyState = document.getElementById('emptyState');
const loadingOverlay = document.getElementById('loadingOverlay');
const totalJobs = document.getElementById('totalJobs');
const totalApplicants = document.getElementById('totalApplicants');

// Applicants Modal
const applicantsModal = document.getElementById('applicantsModal');
const applicantsModalOverlay = document.getElementById('applicantsModalOverlay');
const closeApplicantsModal = document.getElementById('closeApplicantsModal');
const applicantJobTitle = document.getElementById('applicantJobTitle');
const applicantsList = document.getElementById('applicantsList');
const noApplicants = document.getElementById('noApplicants');

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

    // Check if user is a recruiter
    if (userData.role !== 'recruiter') {
      window.location.href = 'dashboard-seeker.html';
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
    loadJobs();
    loadStats();

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
// Modal Controls
// ==========================================

newJobBtn.addEventListener('click', () => {
  jobModal.classList.remove('hidden');
  jobForm.reset();
});

closeModal.addEventListener('click', () => {
  jobModal.classList.add('hidden');
});

cancelBtn.addEventListener('click', () => {
  jobModal.classList.add('hidden');
});

modalOverlay.addEventListener('click', () => {
  jobModal.classList.add('hidden');
});

closeApplicantsModal.addEventListener('click', () => {
  applicantsModal.classList.add('hidden');
});

applicantsModalOverlay.addEventListener('click', () => {
  applicantsModal.classList.add('hidden');
});

// Prevent modal close when clicking inside modal content
document.querySelector('.modal-content').addEventListener('click', (e) => {
  e.stopPropagation();
});

// ==========================================
// Post New Job
// ==========================================

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert('Please log in to post a job');
    return;
  }

  const jobData = {
    title: document.getElementById('jobTitle').value.trim(),
    company: document.getElementById('companyName').value.trim(),
    location: document.getElementById('location').value.trim(),
    salary: document.getElementById('salary').value.trim(),
    description: document.getElementById('description').value.trim(),
    recruiterId: currentUser.uid,
    recruiterEmail: currentUser.email,
    postedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Validate
  if (!jobData.title || !jobData.company || !jobData.location || !jobData.salary || !jobData.description) {
    alert('Please fill in all fields');
    return;
  }

  showLoading(true);

  try {
    // Add job to Firestore
    await db.collection('jobs').add(jobData);

    // Close modal and reset form
    jobModal.classList.add('hidden');
    jobForm.reset();

    // Reload jobs
    await loadJobs();
    await loadStats();

  } catch (error) {
    console.error('Error posting job:', error);
    alert('Error posting job. Please try again.');
  } finally {
    showLoading(false);
  }
});

// ==========================================
// Load Jobs
// ==========================================

async function loadJobs() {
  if (!currentUser) return;

  showLoading(true);

  try {
    // Get jobs posted by current recruiter
    const snapshot = await db.collection('jobs')
      .where('recruiterId', '==', currentUser.uid)
      .orderBy('postedAt', 'desc')
      .get();

    jobsList.innerHTML = '';

    if (snapshot.empty) {
      emptyState.classList.remove('hidden');
      jobsList.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      jobsList.classList.remove('hidden');

      snapshot.forEach((doc) => {
        const job = doc.data();
        const jobCard = createJobCard(doc.id, job);
        jobsList.appendChild(jobCard);
      });
    }

  } catch (error) {
    console.error('Error loading jobs:', error);
    alert('Error loading jobs. Please refresh the page.');
  } finally {
    showLoading(false);
  }
}

// ==========================================
// Create Job Card
// ==========================================

function createJobCard(jobId, job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  
  // Format date
  const postedDate = job.postedAt ? 
    new Date(job.postedAt.toDate()).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    }) : 'Just now';

  card.innerHTML = `
    <div class="job-card-header">
      <div>
        <h3 class="job-title">${escapeHtml(job.title)}</h3>
        <p class="company-name">${escapeHtml(job.company)}</p>
      </div>
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
      <button class="applicant-count" data-job-id="${jobId}">
        <span class="applicant-count-number">0</span> applicants
      </button>
    </div>
  `;

  // Add click handler for viewing applicants
  const applicantBtn = card.querySelector('.applicant-count');
  applicantBtn.addEventListener('click', () => {
    viewApplicants(jobId, job.title);
  });

  // Load applicant count for this job
  loadApplicantCount(jobId, card);

  return card;
}

// ==========================================
// Load Applicant Count
// ==========================================

async function loadApplicantCount(jobId, cardElement) {
  try {
    const snapshot = await db.collection('applications')
      .where('jobId', '==', jobId)
      .get();

    const count = snapshot.size;
    const countElement = cardElement.querySelector('.applicant-count-number');
    if (countElement) {
      countElement.textContent = count;
    }
  } catch (error) {
    console.error('Error loading applicant count:', error);
  }
}

// ==========================================
// View Applicants
// ==========================================

async function viewApplicants(jobId, jobTitle) {
  currentJobId = jobId;
  applicantJobTitle.textContent = jobTitle;
  applicantsList.innerHTML = '';
  applicantsModal.classList.remove('hidden');

  showLoading(true);

  try {
    const snapshot = await db.collection('applications')
      .where('jobId', '==', jobId)
      .orderBy('appliedAt', 'desc')
      .get();

    if (snapshot.empty) {
      noApplicants.classList.remove('hidden');
      applicantsList.style.display = 'none';
    } else {
      noApplicants.classList.add('hidden');
      applicantsList.style.display = 'block';

      snapshot.forEach((doc) => {
        const application = doc.data();
        const applicantCard = createApplicantCard(application);
        applicantsList.appendChild(applicantCard);
      });
    }

  } catch (error) {
    console.error('Error loading applicants:', error);
    alert('Error loading applicants. Please try again.');
  } finally {
    showLoading(false);
  }
}

// ==========================================
// Create Applicant Card
// ==========================================

function createApplicantCard(application) {
  const card = document.createElement('div');
  card.className = 'applicant-card';

  // Get initials for avatar
  const initials = application.candidateEmail.charAt(0).toUpperCase();

  // Format date
  const appliedDate = application.appliedAt ?
    new Date(application.appliedAt.toDate()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now';

  card.innerHTML = `
    <div class="applicant-avatar">${initials}</div>
    <div class="applicant-info">
      <div class="applicant-name">${escapeHtml(application.candidateEmail.split('@')[0])}</div>
      <div class="applicant-email">${escapeHtml(application.candidateEmail)}</div>
    </div>
    <div class="applicant-date">${appliedDate}</div>
  `;

  return card;
}

// ==========================================
// Load Statistics
// ==========================================

async function loadStats() {
  if (!currentUser) return;

  try {
    // Count total jobs
    const jobsSnapshot = await db.collection('jobs')
      .where('recruiterId', '==', currentUser.uid)
      .get();
    
    totalJobs.textContent = jobsSnapshot.size;

    // Count total applicants across all jobs
    const applicationsSnapshot = await db.collection('applications')
      .where('recruiterId', '==', currentUser.uid)
      .get();

    totalApplicants.textContent = applicationsSnapshot.size;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
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

// Listen for new applications in real-time
if (currentUser) {
  db.collection('applications')
    .where('recruiterId', '==', currentUser.uid)
    .onSnapshot(() => {
      loadStats();
      // Reload jobs to update applicant counts
      const jobCards = document.querySelectorAll('.job-card');
      jobCards.forEach(card => {
        const jobId = card.querySelector('.applicant-count').dataset.jobId;
        if (jobId) {
          loadApplicantCount(jobId, card);
        }
      });
    }, (error) => {
      console.error('Error listening to applications:', error);
    });
}
