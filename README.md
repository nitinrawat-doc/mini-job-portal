# Mini Job Portal - Setup Guide

A simple job listing platform where recruiters can post jobs and job seekers can search and apply.

## 📁 Project Structure

```
mini-job-portal/
├── index.html              # Login/Register page
├── dashboard-recruiter.html # Recruiter dashboard
├── dashboard-seeker.html   # Job seeker dashboard
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js            # Authentication logic
│   ├── recruiter.js       # Recruiter functionality
│   └── seeker.js          # Job seeker functionality
└── README.md              # This file
```

## 🔥 Firebase Setup Steps

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "mini-job-portal")
4. Disable Google Analytics (optional for this project)
5. Click "Create Project"

### Step 2: Register Web App

1. In your Firebase project, click the web icon (`</>`)
2. Enter app nickname (e.g., "Job Portal Web")
3. Click "Register app"
4. Copy the Firebase configuration object

### Step 3: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Step 4: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Enable"

### Step 5: Configure Firestore Security Rules

Go to "Firestore Database" → "Rules" and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jobs collection - anyone can read, only recruiters can write
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'recruiter';
      allow update, delete: if request.auth != null && 
        resource.data.recruiterId == request.auth.uid;
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.candidateId || 
         request.auth.uid == resource.data.recruiterId);
      allow create: if request.auth != null;
    }
  }
}
```

### Step 6: Update Firebase Configuration

1. Open `js/firebase-config.js`
2. Replace the configuration object with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🗄️ Firestore Data Structure

### Users Collection
```javascript
users/{userId}
{
  email: "user@example.com",
  role: "recruiter" | "seeker",
  name: "John Doe",
  createdAt: timestamp
}
```

### Jobs Collection
```javascript
jobs/{jobId}
{
  title: "Software Engineer",
  company: "Tech Corp",
  location: "New York, NY",
  salary: "$80,000 - $100,000",
  description: "We are looking for...",
  recruiterId: "user123",
  recruiterEmail: "recruiter@example.com",
  postedAt: timestamp
}
```

### Applications Collection
```javascript
applications/{applicationId}
{
  jobId: "job123",
  jobTitle: "Software Engineer",
  candidateId: "user456",
  candidateEmail: "seeker@example.com",
  recruiterId: "user123",
  appliedAt: timestamp,
  status: "pending"
}
```

## 🚀 Running the Project

### Option 1: Using Live Server (Recommended)

1. Install VS Code extension: "Live Server"
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 2: Using Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

### Option 3: Using Node.js HTTP Server

```bash
# Install globally
npm install -g http-server

# Run in project directory
http-server

# Then open: http://localhost:8080
```

## 👥 User Flow

### For Recruiters:
1. Register with email/password and select "Recruiter" role
2. Login to access recruiter dashboard
3. Post new jobs with details
4. View all posted jobs
5. View applicants for each job

### For Job Seekers:
1. Register with email/password and select "Job Seeker" role
2. Login to access job seeker dashboard
3. Browse all available jobs
4. Search jobs by title
5. Filter jobs by location
6. Apply to jobs (one application per job)

## 🔐 Security Features

- Firebase Authentication for secure login
- Role-based access control
- Firestore security rules prevent unauthorized access
- Password validation (minimum 6 characters)
- Duplicate application prevention

## 📱 Responsive Design

- Mobile-friendly layout
- Responsive grid system
- Touch-friendly buttons
- Adaptive navigation

## 🛠️ Troubleshooting

### CORS Errors
- Must run via a local server (not by opening HTML directly)
- Use Live Server or HTTP server methods above

### Authentication Errors
- Check Firebase configuration in `firebase-config.js`
- Verify Email/Password authentication is enabled in Firebase Console

### Firestore Errors
- Ensure Firestore is initialized in test mode
- Check security rules are properly configured
- Verify network connection

## 📚 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Hosting**: Can be deployed to Firebase Hosting, Netlify, or Vercel

## 🎯 Features Checklist

- ✅ User registration and login
- ✅ Role-based dashboards (Recruiter/Job Seeker)
- ✅ Job posting by recruiters
- ✅ Job browsing and searching
- ✅ Job filtering by location
- ✅ Job application system
- ✅ Duplicate application prevention
- ✅ Application tracking
- ✅ Responsive design

## 📝 Future Enhancements (Optional)

- Job editing and deletion
- Application status updates (accepted/rejected)
- User profile management
- Resume upload functionality
- Email notifications
- Advanced search filters
- Job categories/tags

## 📄 License

This is a college mini project template - free to use and modify.

---

**Note**: Remember to never commit your `firebase-config.js` with real API keys to public repositories. Use environment variables for production deployments.
