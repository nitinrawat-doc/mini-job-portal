// ==================================
// JOB SEEKER DASHBOARD - Real Jobs API
// ==================================

const auth = firebase.auth();
const db = firebase.firestore();

// Global variables
let currentUser = null;
let allJobs = [];
let savedJobs = new Set();
let userApplications = new Set();

// ==================================
// INITIALIZATION
// ==================================

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = user;
    
    // Verify user is job seeker
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'seeker') {
            await auth.signOut();
            window.location.href = 'index.html';
            return;
        }

        const userData = userDoc.data();
        document.getElementById('userName').textContent = userData.name || user.email;

        // Load data
        await Promise.all([
            loadSavedJobs(),
            loadApplications(),
            loadJobs()
        ]);

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error loading dashboard', 'error');
    }
});

// ==================================
// FETCH REAL JOBS FROM PUBLIC API
// ==================================

async function loadJobs(query = '', location = '') {
    showLoading(true);

    try {
        // Using Adzuna Public API (No API key required for demo)
        // Or you can use other public APIs
        
        // For now, using comprehensive demo data that looks like real jobs
        await loadDemoJobs();
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        showToast('Error loading jobs', 'error');
        await loadDemoJobs();
    } finally {
        showLoading(false);
    }
}

// ==================================
// DEMO JOBS (Real-world style data)
// ==================================

async function loadDemoJobs() {
    allJobs = [
        {
            id: 'job-1',
            title: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'San Francisco, CA',
            salary: '$120,000 - $160,000',
            description: 'We are seeking an experienced Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable applications using modern technologies.\n\nResponsibilities:\n- Design and implement robust, scalable applications\n- Collaborate with cross-functional teams\n- Mentor junior developers\n- Write clean, maintainable code\n- Participate in code reviews\n\nRequirements:\n- 5+ years of professional experience\n- Strong knowledge of JavaScript, React, Node.js\n- Experience with AWS or other cloud platforms\n- Excellent problem-solving skills\n- Bachelor\'s degree in Computer Science or related field',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Tech Solutions',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-2',
            title: 'Frontend Developer',
            company: 'Creative Digital Agency',
            location: 'New York, NY',
            salary: '$80,000 - $100,000',
            description: 'Join our creative team as a Frontend Developer. You will work on exciting client projects, building beautiful and responsive user interfaces.\n\nWhat You\'ll Do:\n- Build responsive web applications\n- Collaborate with designers and backend developers\n- Optimize applications for maximum speed\n- Ensure cross-browser compatibility\n- Stay up-to-date with emerging technologies\n\nQualifications:\n- 2+ years of frontend development experience\n- Proficiency in HTML, CSS, JavaScript\n- Experience with React or Vue.js\n- Understanding of responsive design principles\n- Portfolio showcasing your work',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Creative Digital',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-3',
            title: 'Product Manager',
            company: 'Startup Innovations',
            location: 'Austin, TX',
            salary: '$100,000 - $140,000',
            description: 'We are looking for a passionate Product Manager to lead our product development initiatives. You will work closely with engineering, design, and business teams to define product strategy and roadmap.\n\nKey Responsibilities:\n- Define product vision and strategy\n- Prioritize features and create product roadmaps\n- Conduct user research and gather feedback\n- Work with engineering teams on implementation\n- Analyze product metrics and KPIs\n\nRequired Skills:\n- 3+ years of product management experience\n- Strong analytical and problem-solving skills\n- Excellent communication abilities\n- Experience with Agile methodologies\n- Technical background is a plus',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Startup Innovations',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-4',
            title: 'Data Scientist',
            company: 'Analytics Corp',
            location: 'Seattle, WA',
            salary: '$110,000 - $150,000',
            description: 'Join our data science team to build predictive models and extract insights from large datasets. You will work with cutting-edge technologies and solve complex business problems.\n\nResponsibilities:\n- Develop machine learning models\n- Analyze large datasets to extract insights\n- Collaborate with stakeholders to define requirements\n- Present findings to technical and non-technical audiences\n- Implement data pipelines and workflows\n\nRequirements:\n- MS or PhD in Computer Science, Statistics, or related field\n- Strong programming skills in Python or R\n- Experience with machine learning frameworks\n- Knowledge of SQL and big data technologies\n- Excellent analytical skills',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Analytics Corp',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-5',
            title: 'UX/UI Designer',
            company: 'Design Studio',
            location: 'Los Angeles, CA',
            salary: '$75,000 - $95,000',
            description: 'We need a talented UX/UI Designer to create beautiful and intuitive user experiences. You will conduct user research, create wireframes and prototypes, and work closely with developers.\n\nWhat You\'ll Do:\n- Conduct user research and usability testing\n- Create wireframes, prototypes, and high-fidelity designs\n- Collaborate with product and engineering teams\n- Maintain and evolve design systems\n- Present design concepts and rationale\n\nQualifications:\n- 2+ years of UX/UI design experience\n- Proficiency in Figma and Adobe Creative Suite\n- Strong portfolio showcasing your work\n- Understanding of user-centered design principles\n- Excellent communication skills',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Design Studio',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-6',
            title: 'DevOps Engineer',
            company: 'Cloud Systems',
            location: 'Remote',
            salary: '$105,000 - $135,000',
            description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will work on automating deployment processes and ensuring system reliability.\n\nKey Responsibilities:\n- Manage AWS/Azure cloud infrastructure\n- Build and maintain CI/CD pipelines\n- Implement Infrastructure as Code (Terraform)\n- Monitor system performance and reliability\n- Collaborate with development teams\n\nRequirements:\n- 3+ years of DevOps experience\n- Strong knowledge of AWS or Azure\n- Experience with Docker and Kubernetes\n- Proficiency in scripting (Python, Bash)\n- Understanding of networking and security best practices',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Cloud Systems',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-7',
            title: 'Mobile App Developer',
            company: 'Mobile Innovations',
            location: 'Boston, MA',
            salary: '$90,000 - $120,000',
            description: 'We are seeking a Mobile App Developer to build amazing mobile experiences for iOS and Android platforms. You will work on innovative projects using the latest technologies.\n\nResponsibilities:\n- Develop mobile applications for iOS and Android\n- Write clean, maintainable code\n- Collaborate with designers and backend developers\n- Optimize app performance\n- Submit apps to App Store and Play Store\n\nQualifications:\n- 3+ years of mobile development experience\n- Proficiency in Swift/Kotlin or React Native\n- Experience with RESTful APIs\n- Understanding of mobile UI/UX principles\n- Published apps in app stores',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Mobile Innovations',
            apply_link: 'https://example.com/apply',
            logo: null
        },
        {
            id: 'job-8',
            title: 'Full Stack Developer',
            company: 'Web Solutions LLC',
            location: 'Chicago, IL',
            salary: '$95,000 - $125,000',
            description: 'Join our team as a Full Stack Developer. You will work on both frontend and backend, building complete web applications from scratch.\n\nWhat You\'ll Do:\n- Develop full-stack web applications\n- Design and implement RESTful APIs\n- Work with databases (SQL and NoSQL)\n- Collaborate with product and design teams\n- Write tests and documentation\n\nRequirements:\n- 4+ years of full-stack development experience\n- Proficiency in JavaScript/TypeScript\n- Experience with React and Node.js\n- Knowledge of database design\n- Strong problem-solving skills',
            employment_type: 'Full-time',
            posted_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            publisher: 'Web Solutions',
            apply_link: 'https://example.com/apply',
            logo: null
        }
    ];

    updateStats();
    displayJobs(allJobs);
}

// ==================================
// DISPLAY JOBS
// ==================================

function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    
    if (jobs.length === 0) {
        jobsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>No Jobs Found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    jobsGrid.innerHTML = jobs.map(job => {
        const isApplied = userApplications.has(job.id);
        const isSaved = savedJobs.has(job.id);
        const postedDate = formatDate(job.posted_date);

        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-card-header">
                    <div>
                        <h3 class="job-title">${escapeHtml(job.title)}</h3>
                        <p class="company-name">${escapeHtml(job.company)}</p>
                    </div>
                </div>

                <div class="job-meta">
                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${escapeHtml(job.location)}</span>
                    </div>

                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>${escapeHtml(job.salary)}</span>
                    </div>

                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span>${job.employment_type}</span>
                    </div>
                </div>

                <p class="job-description-preview">${escapeHtml(job.description.substring(0, 150))}...</p>

                <div class="job-footer">
                    <span class="job-posted">Posted ${postedDate}</span>
                    <div class="job-actions">
                        <button class="icon-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveJob('${job.id}')" title="${isSaved ? 'Unsave' : 'Save'}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-primary" onclick="viewJobDetails('${job.id}')" ${isApplied ? 'disabled' : ''}>
                            ${isApplied ? '✓ Applied' : 'View & Apply'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('jobCount').textContent = `${jobs.length} jobs available`;
}

// ==================================
// JOB DETAILS MODAL
// ==================================

function viewJobDetails(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    const isApplied = userApplications.has(jobId);

    const modalContent = `
        <div class="modal-header">
            <h2>${escapeHtml(job.title)}</h2>
            <button class="modal-close" onclick="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="job-details-content">
            <div class="job-header-info">
                <h3>${escapeHtml(job.company)}</h3>
                <div class="job-meta">
                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${escapeHtml(job.location)}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>${escapeHtml(job.salary)}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span>${job.employment_type}</span>
                    </div>
                </div>
            </div>

            <div class="job-description">
                <h4>Job Description</h4>
                <p style="white-space: pre-line;">${escapeHtml(job.description)}</p>
            </div>
        </div>

        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button class="btn btn-success" onclick="applyForJob('${jobId}')" ${isApplied ? 'disabled' : ''}>
                ${isApplied ? '✓ Already Applied' : 'Apply Now'}
            </button>
        </div>
    `;

    document.querySelector('.modal-content').innerHTML = modalContent;
    document.getElementById('jobModal').classList.remove('hidden');
}

// ==================================
// APPLY FOR JOB
// ==================================

async function applyForJob(jobId) {
    if (userApplications.has(jobId)) {
        showToast('You have already applied to this job', 'info');
        return;
    }

    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    try {
        showLoading(true);

        // Save application to Firestore
        await db.collection('applications').add({
            jobId: jobId,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'applied'
        });

        // Update local state
        userApplications.add(jobId);

        showToast('Application submitted successfully!', 'success');
        closeModal();
        displayJobs(allJobs); // Refresh display
        updateStats();

    } catch (error) {
        console.error('Error applying:', error);
        showToast('Failed to submit application', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================================
// SAVE/UNSAVE JOB
// ==================================

async function toggleSaveJob(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    try {
        if (savedJobs.has(jobId)) {
            // Unsave
            const querySnapshot = await db.collection('savedJobs')
                .where('jobId', '==', jobId)
                .where('userId', '==', currentUser.uid)
                .get();

            querySnapshot.forEach(doc => doc.ref.delete());
            savedJobs.delete(jobId);
            showToast('Job removed from saved', 'info');
        } else {
            // Save
            await db.collection('savedJobs').add({
                jobId: jobId,
                jobTitle: job.title,
                company: job.company,
                location: job.location,
                userId: currentUser.uid,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            savedJobs.add(jobId);
            showToast('Job saved!', 'success');
        }

        displayJobs(allJobs); // Refresh display
        updateStats();

    } catch (error) {
        console.error('Error saving job:', error);
        showToast('Failed to save job', 'error');
    }
}

// ==================================
// LOAD USER DATA
// ==================================

async function loadSavedJobs() {
    try {
        const snapshot = await db.collection('savedJobs')
            .where('userId', '==', currentUser.uid)
            .get();

        savedJobs = new Set(snapshot.docs.map(doc => doc.data().jobId));
    } catch (error) {
        console.error('Error loading saved jobs:', error);
    }
}

async function loadApplications() {
    try {
        const snapshot = await db.collection('applications')
            .where('userId', '==', currentUser.uid)
            .get();

        userApplications = new Set(snapshot.docs.map(doc => doc.data().jobId));
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// ==================================
// SEARCH & FILTER
// ==================================

document.getElementById('searchBtn')?.addEventListener('click', () => {
    performSearch();
});

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

document.getElementById('locationFilter')?.addEventListener('change', () => {
    performSearch();
});

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const location = document.getElementById('locationFilter').value;

    let filtered = allJobs;

    // Filter by search query
    if (query) {
        filtered = filtered.filter(job =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query)
        );
    }

    // Filter by location
    if (location) {
        filtered = filtered.filter(job => job.location === location);
    }

    displayJobs(filtered);
    document.getElementById('jobCount').textContent = `${filtered.length} jobs found`;
}

// ==================================
// UPDATE STATS
// ==================================

function updateStats() {
    document.getElementById('totalJobs').textContent = allJobs.length;
    document.getElementById('appliedCount').textContent = userApplications.size;
    document.getElementById('savedCount').textContent = savedJobs.size;
}

// ==================================
// UTILITY FUNCTIONS
// ==================================

function formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeModal() {
    document.getElementById('jobModal').classList.add('hidden');
}

function showLoading(show) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.classList.toggle('hidden', !show);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});