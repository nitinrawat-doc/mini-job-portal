# 🏗️ Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  index.html  │  │  dashboard-  │  │  dashboard-  │          │
│  │ (Login/Auth) │  │  recruiter   │  │   seeker     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                            ▼                                      │
│                   ┌────────────────┐                             │
│                   │   JavaScript    │                             │
│                   │   Controllers   │                             │
│                   │                 │                             │
│                   │ • auth.js       │                             │
│                   │ • recruiter.js  │                             │
│                   │ • seeker.js     │                             │
│                   └────────┬────────┘                             │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ Firebase SDK
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                            ▼         FIREBASE BACKEND             │
│                                                                   │
│  ┌──────────────────┐              ┌─────────────────────────┐  │
│  │  Authentication  │              │   Firestore Database    │  │
│  │                  │              │                         │  │
│  │  • Email/Pass    │◄────────────►│  Collections:           │  │
│  │  • User Sessions │              │   • users               │  │
│  │                  │              │   • jobs                │  │
│  └──────────────────┘              │   • applications        │  │
│                                     └─────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Firestore)

### Collection: `users`
```
users/
└── {userId}
    ├── name: string
    ├── email: string
    ├── role: "recruiter" | "seeker"
    └── createdAt: timestamp
```

**Example:**
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  role: "recruiter",
  createdAt: Timestamp(2024-01-15 10:30:00)
}
```

---

### Collection: `jobs`
```
jobs/
└── {jobId}
    ├── title: string
    ├── company: string
    ├── location: string
    ├── salary: string
    ├── description: string
    ├── recruiterId: string (references users/{userId})
    ├── recruiterEmail: string
    └── postedAt: timestamp
```

**Example:**
```javascript
{
  title: "Senior Frontend Developer",
  company: "Tech Corp Inc.",
  location: "New York, NY",
  salary: "$120,000 - $150,000",
  description: "We are looking for an experienced...",
  recruiterId: "abc123xyz",
  recruiterEmail: "recruiter@techcorp.com",
  postedAt: Timestamp(2024-01-15 14:00:00)
}
```

---

### Collection: `applications`
```
applications/
└── {applicationId}
    ├── jobId: string (references jobs/{jobId})
    ├── jobTitle: string (denormalized)
    ├── candidateId: string (references users/{userId})
    ├── candidateEmail: string (denormalized)
    ├── recruiterId: string (denormalized)
    ├── appliedAt: timestamp
    └── status: "pending" | "accepted" | "rejected"
```

**Example:**
```javascript
{
  jobId: "job123",
  jobTitle: "Senior Frontend Developer",
  candidateId: "user456",
  candidateEmail: "seeker@example.com",
  recruiterId: "abc123xyz",
  appliedAt: Timestamp(2024-01-16 09:15:00),
  status: "pending"
}
```

---

## User Flows

### 1️⃣ Registration Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User   │────►│  Fill    │────►│ Firebase │────►│ Firestore│
│ Visits  │     │  Form    │     │  Auth    │     │  Write   │
│ Page    │     │  + Role  │     │  Create  │     │  Profile │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                                                           │
                     ┌─────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  Redirect to │
              │  Dashboard   │
              │  (by Role)   │
              └──────────────┘
```

---

### 2️⃣ Login Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User   │────►│  Enter   │────►│ Firebase │────►│ Firestore│
│ Clicks  │     │Email/Pass│     │  Auth    │     │  Get     │
│ Login   │     │          │     │ Validate │     │  Role    │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                                                           │
                     ┌─────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  Redirect to │
              │  Appropriate │
              │  Dashboard   │
              └──────────────┘
```

---

### 3️⃣ Post Job Flow (Recruiter)

```
┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Recruiter │───►│  Fill    │───►│ Firestore│───►│  Update  │
│  Clicks   │    │  Job     │    │  Write   │    │  UI with │
│ "Post Job"│    │  Form    │    │  Job Doc │    │  New Job │
└───────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Job Document Created:**
```javascript
jobs/{auto-generated-id} = {
  title: "...",
  company: "...",
  location: "...",
  salary: "...",
  description: "...",
  recruiterId: currentUser.uid,
  recruiterEmail: currentUser.email,
  postedAt: serverTimestamp()
}
```

---

### 4️⃣ Apply for Job Flow (Job Seeker)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Seeker   │───►│  View    │───►│  Click   │───►│ Firestore│───►│  Update  │
│ Browses  │    │  Job     │    │ "Apply"  │    │  Write   │    │  UI +    │
│ Jobs     │    │ Details  │    │  Button  │    │  App Doc │    │  Toast   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Application Document Created:**
```javascript
applications/{auto-generated-id} = {
  jobId: "job123",
  jobTitle: "Senior Frontend Developer",
  candidateId: currentUser.uid,
  candidateEmail: currentUser.email,
  recruiterId: "recruiterUserId",
  appliedAt: serverTimestamp(),
  status: "pending"
}
```

**Duplicate Prevention:**
- Before creating application, check if user already applied
- Use Set() in JavaScript to track applied jobs
- Show "Already Applied" badge instead of Apply button

---

### 5️⃣ View Applicants Flow (Recruiter)

```
┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Recruiter │───►│  Click   │───►│ Firestore│───►│  Show    │
│  Sees     │    │"X appli- │    │  Query   │    │  List of │
│  Jobs     │    │  cants"  │    │ Where    │    │  Appli-  │
│           │    │  Badge   │    │ jobId=X  │    │  cants   │
└───────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Firestore Query:**
```javascript
db.collection('applications')
  .where('jobId', '==', selectedJobId)
  .orderBy('appliedAt', 'desc')
  .get()
```

---

## Data Relationships

```
┌──────────┐
│  users   │
│ (Seeker) │
└────┬─────┘
     │ candidateId
     │
     │     ┌──────────────┐
     └────►│ applications │
           └──────┬───────┘
                  │ jobId
                  │
                  ▼
           ┌──────────┐
           │   jobs   │
           └────┬─────┘
                │ recruiterId
                │
                ▼
           ┌──────────┐
           │  users   │
           │(Recruiter)│
           └──────────┘
```

---

## Security Rules (Firestore)

### Users Collection
```javascript
// Users can read all users (for getting names/emails)
// Users can only write their own document
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

### Jobs Collection
```javascript
// Anyone authenticated can read jobs
// Only recruiters can create jobs
// Only job owner can update/delete
match /jobs/{jobId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'recruiter';
  allow update, delete: if request.auth != null && 
                            resource.data.recruiterId == request.auth.uid;
}
```

### Applications Collection
```javascript
// Can read if you're the candidate OR the recruiter
// Anyone can create (job seekers apply)
match /applications/{applicationId} {
  allow read: if request.auth != null && 
                 (request.auth.uid == resource.data.candidateId || 
                  request.auth.uid == resource.data.recruiterId);
  allow create: if request.auth != null;
}
```

---

## Search & Filter Logic

### Search by Title (Frontend)
```javascript
// Filter in JavaScript after loading all jobs
filteredJobs = allJobs.filter(job => 
  job.title.toLowerCase().includes(searchTerm) ||
  job.company.toLowerCase().includes(searchTerm) ||
  job.description.toLowerCase().includes(searchTerm)
);
```

### Filter by Location (Frontend)
```javascript
// Exact match filter
filteredJobs = allJobs.filter(job => 
  !selectedLocation || job.location === selectedLocation
);
```

### Combined Search + Filter
```javascript
filteredJobs = allJobs.filter(job => {
  const matchesSearch = !searchTerm || 
    job.title.toLowerCase().includes(searchTerm);
  
  const matchesLocation = !selectedLocation || 
    job.location === selectedLocation;
  
  return matchesSearch && matchesLocation;
});
```

---

## Real-time Updates

### Job List (Job Seeker Dashboard)
```javascript
// Listen for changes to jobs collection
db.collection('jobs')
  .orderBy('postedAt', 'desc')
  .onSnapshot((snapshot) => {
    // Reload jobs when any job is added/modified/deleted
    loadJobs();
  });
```

### Application Count (Recruiter Dashboard)
```javascript
// Listen for new applications
db.collection('applications')
  .where('recruiterId', '==', currentUser.uid)
  .onSnapshot(() => {
    // Update stats and applicant counts
    loadStats();
  });
```

---

## Performance Optimization

### 1. Denormalization
We store redundant data (jobTitle, candidateEmail, recruiterId) in applications to avoid extra reads:

**Without Denormalization:**
```
Read applications → Read job doc → Read user doc = 3 reads per application
```

**With Denormalization:**
```
Read applications = 1 read (job title already there)
```

### 2. Client-side Filtering
- Load all jobs once
- Filter in JavaScript (no extra database reads)
- Faster than querying Firestore for each search

### 3. Pagination (For Future)
```javascript
// Add pagination for large datasets
db.collection('jobs')
  .orderBy('postedAt', 'desc')
  .limit(20)
  .startAfter(lastDoc)
  .get()
```

---

## Error Handling

### Authentication Errors
```javascript
try {
  await auth.signInWithEmailAndPassword(email, password);
} catch (error) {
  // User-friendly messages
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found';
    case 'auth/wrong-password':
      return 'Incorrect password';
    // ... more cases
  }
}
```

### Firestore Errors
```javascript
try {
  await db.collection('jobs').add(jobData);
} catch (error) {
  console.error('Firestore error:', error);
  alert('Error posting job. Please try again.');
}
```

---

## Testing Scenarios

### ✅ Test Case 1: User Registration
1. Open application
2. Click "Create one"
3. Fill form with valid data
4. Select role: Recruiter
5. Submit
6. **Expected:** Redirect to recruiter dashboard

### ✅ Test Case 2: Duplicate Application Prevention
1. Login as job seeker
2. Apply to a job
3. Try to apply again
4. **Expected:** "Already Applied" badge shown, can't apply again

### ✅ Test Case 3: Real-time Updates
1. Open recruiter dashboard in one browser
2. Open job seeker dashboard in another browser
3. Post a job from recruiter
4. **Expected:** Job appears in seeker dashboard immediately

### ✅ Test Case 4: Search Functionality
1. Login as job seeker
2. Type in search box: "developer"
3. **Expected:** Only jobs with "developer" in title/description show

### ✅ Test Case 5: Role-based Access
1. Login as job seeker
2. Try to access: `dashboard-recruiter.html`
3. **Expected:** Redirect to job seeker dashboard

---

## 📊 Sample Data for Testing

Use Firebase Console or this code to add sample data:

```javascript
// Sample Jobs
db.collection('jobs').add({
  title: "Frontend Developer",
  company: "Tech Startup Inc",
  location: "San Francisco, CA",
  salary: "$100,000 - $130,000",
  description: "Build amazing user interfaces with React...",
  recruiterId: "your-recruiter-uid",
  recruiterEmail: "recruiter@example.com",
  postedAt: firebase.firestore.FieldValue.serverTimestamp()
});

db.collection('jobs').add({
  title: "Backend Engineer",
  company: "Data Corp",
  location: "New York, NY",
  salary: "$120,000 - $150,000",
  description: "Design and implement scalable APIs...",
  recruiterId: "your-recruiter-uid",
  recruiterEmail: "recruiter@example.com",
  postedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

---

**This completes the architecture documentation! 🎉**

For implementation details, see the actual code files.
