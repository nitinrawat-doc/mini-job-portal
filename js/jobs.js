// ========================================
// Jobs API & Display Logic - FIXED VERSION
// ========================================

// API Configuration
const API_URL = 'https://remotive.com/api/remote-jobs';

// Pagination
let currentPage = 1;
let allJobs = [];
const JOBS_PER_PAGE = 9;

// ========================================
// FETCH JOBS FROM API
// ========================================
async function fetchJobs() {
    showLoading(true);
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        allJobs = data.jobs || [];
        displayJobs(allJobs);
        
    } catch (error) {
        console.error('Error fetching jobs:', error);
        document.getElementById('jobsContainer').innerHTML = 
            '<p style="grid-column: 1/-1; text-align: center;">Error loading jobs. Please try again later.</p>';
    } finally {
        showLoading(false);
    }
}

// ========================================
// DISPLAY JOBS
// ========================================
function displayJobs(jobs) {
    const container = document.getElementById('jobsContainer');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No jobs found.</p>';
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
    // Clear container
    container.innerHTML = '';
    
    // Create job cards
    paginatedJobs.forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
    });
    
    // Update pagination
    updatePaginationButtons(jobs.length);
}

// ========================================
// CREATE JOB CARD
// ========================================
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    // Create unique ID for this job
    const jobId = job.id || `job-${Date.now()}-${Math.random()}`;
    
    card.innerHTML = `
        <h3>${escapeHtml(job.title)}</h3>
        <p class="company">${escapeHtml(job.company_name)}</p>
        <p class="location">📍 ${escapeHtml(job.candidate_required_location || 'Remote')}</p>
        <p class="salary">💰 ${escapeHtml(job.salary || 'Not specified')}</p>
        <p class="description">${truncateText(job.description, 150)}</p>
        <div class="actions">
            <button class="btn-primary btn-save" id="save-btn-${jobId}" onclick="saveJob('${jobId}')">
                💾 Save Job
            </button>
            <a href="${escapeHtml(job.url)}" target="_blank" class="btn-primary">
                Apply →
            </a>
        </div>
    `;
    
    return card;
}

// ========================================
// SAVE JOB TO FIRESTORE - FIXED VERSION
// ========================================
async function saveJob(jobId) {
    console.log("Save job clicked for:", jobId);
    
    // Check if user is logged in
    const user = auth.currentUser;
    
    if (!user) {
        alert('Please login first to save jobs!');
        window.location.href = 'login.html';
        return;
    }
    
    console.log("User logged in:", user.uid);
    
    // Get the button
    const button = document.getElementById(`save-btn-${jobId}`);
    
    if (!button) {
        console.error("Button not found for jobId:", jobId);
        return;
    }
    
    // Disable button temporarily
    button.disabled = true;
    button.textContent = 'Saving...';
    
    try {
        // Find the job in our array
        const job = allJobs.find(j => j.id == jobId || `job-${j.id}` == jobId);
        
        if (!job) {
            throw new Error('Job not found in list');
        }
        
        console.log("Job found:", job.title);
        
        // Check if already saved
        const existingJob = await db.collection('savedJobs')
            .where('userId', '==', user.uid)
            .where('jobId', '==', String(jobId))
            .get();
        
        if (!existingJob.empty) {
            showToast('Job already saved!');
            button.textContent = '✓ Already Saved';
            button.classList.add('saved');
            return;
        }
        
        // Prepare job data
        const jobData = {
            userId: user.uid,
            userEmail: user.email,
            jobId: String(jobId),
            title: job.title || 'No title',
            company: job.company_name || 'Unknown company',
            location: job.candidate_required_location || 'Remote',
            salary: job.salary || 'Not specified',
            description: truncateText(job.description || 'No description', 150),
            url: job.url || '#',
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log("Saving job data:", jobData);
        
        // Save to Firestore
        const docRef = await db.collection('savedJobs').add(jobData);
        
        console.log("Job saved successfully! Doc ID:", docRef.id);
        
        // Update button
        button.textContent = '✓ Saved';
        button.classList.add('saved');
        
        // Show success message
        showToast('Job saved successfully!');
        
    } catch (error) {
        console.error('Error saving job:', error);
        
        // Show user-friendly error
        let errorMessage = 'Error saving job. ';
        
        if (error.code === 'permission-denied') {
            errorMessage += 'Permission denied. Check Firestore rules.';
        } else if (error.code === 'unauthenticated') {
            errorMessage += 'Please login again.';
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage);
        
        // Re-enable button
        button.disabled = false;
        button.textContent = '💾 Save Job';
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
function searchJobs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const location = document.getElementById('locationInput').value.toLowerCase();
    
    if (!searchTerm && !location) {
        displayJobs(allJobs);
        return;
    }
    
    const filteredJobs = allJobs.filter(job => {
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company_name.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm);
        
        const matchesLocation = !location ||
            (job.candidate_required_location && 
             job.candidate_required_location.toLowerCase().includes(location));
        
        return matchesSearch && matchesLocation;
    });
    
    currentPage = 1;
    displayJobs(filteredJobs);
}

// ========================================
// PAGINATION
// ========================================
function nextPage() {
    currentPage++;
    displayJobs(allJobs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayJobs(allJobs);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updatePaginationButtons(totalJobs) {
    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function truncateText(text, maxLength) {
    if (!text) return '';
    
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// INITIALIZE
// ========================================
if (document.getElementById('jobsContainer')) {
    // Wait for auth state before loading jobs
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User authenticated, loading jobs...");
            fetchJobs();
        } else {
            console.log("No user, redirecting to login...");
            // Uncomment if you want to force login
            // window.location.href = 'login.html';
            
            // Or allow browsing without login
            fetchJobs();
        }
    });
}

// Search on Enter key
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchJobs();
});

document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchJobs();
});