# 🚀 Quick Start Guide - Mini Job Portal

## Step-by-Step Setup (5 Minutes)

### Step 1: Download and Extract Files ✅
You already have the complete project structure!

```
mini-job-portal/
├── README.md              ← Comprehensive documentation
├── QUICKSTART.md          ← This file
├── index.html             ← Login/Register page
├── dashboard-recruiter.html
├── dashboard-seeker.html
├── css/
│   └── styles.css
└── js/
    ├── firebase-config.js ← EDIT THIS FILE
    ├── auth.js
    ├── recruiter.js
    └── seeker.js
```

### Step 2: Create Firebase Project (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name: `mini-job-portal` (or any name)
4. **Disable** Google Analytics (optional)
5. Click **"Create Project"**

### Step 3: Setup Firebase Services (2 minutes)

#### A. Enable Authentication
1. In Firebase Console → **Authentication**
2. Click **"Get Started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

#### B. Create Firestore Database
1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose your location
5. Click **"Enable"**

#### C. Register Web App
1. In Firebase Console → Project Overview
2. Click the **web icon** (`</>`)
3. Enter nickname: `Job Portal Web`
4. Click **"Register app"**
5. **Copy the config object** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:abc123"
};
```

### Step 4: Configure Your App (1 minute)

1. Open `js/firebase-config.js` in a text editor
2. **Replace** the placeholder config with YOUR config from Firebase
3. Save the file

**Before:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // ...
};
```

**After:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",  // Your actual API key
  authDomain: "mini-job-portal-12345.firebaseapp.com",
  projectId: "mini-job-portal-12345",
  // ... rest of your config
};
```

### Step 5: Run the Application

#### Option A: VS Code Live Server (Recommended)
1. Install **Live Server** extension in VS Code
2. Right-click `index.html`
3. Select **"Open with Live Server"**
4. Your browser will open automatically! 🎉

#### Option B: Python Server
```bash
python -m http.server 8000
# Open: http://localhost:8000
```

#### Option C: Node.js Server
```bash
npx http-server
# Open: http://localhost:8080
```

---

## 🎯 Testing Your Application

### Test as Recruiter:
1. Click **"Create one"** on login page
2. Fill in details and select **"Recruiter"**
3. Click **"Create Account"**
4. You'll be redirected to Recruiter Dashboard
5. Click **"Post New Job"**
6. Fill in job details and submit

### Test as Job Seeker:
1. Open in **incognito/private window** (to test with different user)
2. Register with different email, select **"Job Seeker"**
3. Browse jobs posted by recruiter
4. Search and filter jobs
5. Click **"View Details"** on any job
6. Click **"Apply for this Job"**

### Test Application Flow:
1. Go back to recruiter account
2. Click on **applicant count** on any job card
3. See the applicant you just added! ✅

---

## ⚠️ Common Issues & Solutions

### Issue: "CORS Error" or blank page
**Solution:** You must run via a local server (not by opening HTML directly)
- Use Live Server, Python, or Node.js server

### Issue: Login/Register not working
**Solution:** Check these:
1. Firebase config in `firebase-config.js` is correct
2. Email/Password authentication is enabled in Firebase Console
3. Check browser console (F12) for error messages

### Issue: Jobs not loading
**Solution:**
1. Check Firestore is created and in test mode
2. Wait a few seconds for database initialization
3. Check browser console for errors

### Issue: Can't apply to jobs
**Solution:**
1. Make sure you're logged in as Job Seeker (not Recruiter)
2. Check that the job exists
3. Check browser console for errors

---

## 📱 Features to Try

✅ **Authentication**
- Register as both Recruiter and Job Seeker
- Login/Logout functionality

✅ **Recruiter Features**
- Post multiple jobs
- View your posted jobs
- See applicant count
- View applicant details

✅ **Job Seeker Features**
- Browse all jobs
- Search jobs by title
- Filter jobs by location
- Apply to jobs
- See which jobs you've applied to

✅ **Security**
- Can't apply to same job twice
- Role-based access (recruiters can't apply to jobs)
- Secure authentication

---

## 🎨 Customization Ideas

Want to make it your own? Try:

1. **Colors**: Edit CSS variables in `css/styles.css`
2. **Logo**: Replace the SVG in navigation
3. **Add Fields**: Add more job fields (experience, job type, etc.)
4. **Styling**: Modify the gradient colors and animations

---

## 📚 Need More Help?

- **Full Documentation**: See `README.md`
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Firestore Guide**: [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)

---

## ✨ Success Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Firebase config updated in code
- [ ] App running on local server
- [ ] Can register and login
- [ ] Can post jobs as recruiter
- [ ] Can apply to jobs as job seeker
- [ ] Can see applications as recruiter

**All checked? Congratulations! Your job portal is ready! 🎉**

---

## 🚀 Next Steps (Optional)

Ready to deploy?
- Deploy to **Firebase Hosting** (free)
- Deploy to **Netlify** or **Vercel** (free)
- Add more features from README.md

**Good luck with your project!** 💪
