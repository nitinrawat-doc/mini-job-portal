// ========================================
// Jobs API & Display Logic
// ========================================

// API Configuration (Using Remotive API - No API key needed!)
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
    
    // Update pagination buttons
    updatePaginationButtons(jobs.length);
}

// ========================================
// CREATE JOB CARD
// ========================================
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    card.innerHTML = `
        <h3>${job.title}</h3>
        <p class="company">${job.company_name}</p>
        <p class="location">📍 ${job.candidate_required_location || 'Remote'}</p>
        <p class="salary">💰 ${job.salary || 'Not specified'}</p>
        <p class="description">${truncateText(job.description, 150)}</p>
        <div class="actions">
            <button class="btn-primary btn-save" onclick="saveJob('${job.id}', event)">
                💾 Save Job
            </button>
            <a href="${job.url}" target="_blank" class="btn-primary">
                Apply →
            </a>
        </div>
    `;
    
    return card;
}

// ========================================
// SAVE JOB TO FIRESTORE
// ========================================
async function saveJob(jobId, event) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('Please login to save jobs!');
        window.location.href = 'login.html';
        return;
    }
    
    const button = event.target;
    
    try {
        // Find the job data
        const job = allJobs.find(j => j.id == jobId);
        
        if (!job) {
            showToast('Job not found!');
            return;
        }
        
        // Save to Firestore
        await db.collection('savedJobs').add({
            userId: user.uid,
            jobId: job.id,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote',
            salary: job.salary || 'Not specified',
            description: truncateText(job.description, 150),
            url: job.url,
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update button
        button.textContent = '✓ Saved';
        button.classList.add('saved');
        button.disabled = true;
        
        showToast('Job saved successfully!');
        
    } catch (error) {
        console.error('Error saving job:', error);
        showToast('Error saving job. Try again!');
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
    
    currentPage = 1; // Reset to first page
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
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// INITIALIZE - Load jobs when page loads
// ========================================
if (document.getElementById('jobsContainer')) {
    fetchJobs();
}

// Add enter key support for search
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchJobs();
});

document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchJobs();
});