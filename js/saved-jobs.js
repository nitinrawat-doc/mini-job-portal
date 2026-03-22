async function loadSavedJobs() {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    window.location.href = "login.html";
    return;
  }

  console.log("Loading saved jobs for user:", user.uid);

  const container = document.getElementById("savedJobsContainer");
  container.innerHTML =
    '<p style="text-align: center;">Loading your saved jobs...</p>';

  try {
    const snapshot = await db
      .collection("savedJobs")
      .where("userId", "==", user.uid)
      .orderBy("savedAt", "desc")
      .get();

    console.log("Found", snapshot.size, "saved jobs");

    if (snapshot.empty) {
      container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <h2>No saved jobs yet!</h2>
                    <p>Start saving jobs from the <a href="dashboard.html" style="color: #3498db;">dashboard</a>.</p>
                </div>
            `;
      return;
    }

    container.innerHTML = "";

    snapshot.forEach((doc) => {
      const job = doc.data();
      const jobCard = createSavedJobCard(job, doc.id);
      container.appendChild(jobCard);
    });
  } catch (error) {
    console.error("Error loading saved jobs:", error);

    let errorMsg = "Error loading saved jobs. ";
    if (error.code === "permission-denied") {
      errorMsg += "Permission denied. Check Firestore rules.";
    } else if (error.code === "failed-precondition") {
      errorMsg += "Missing index. Check console for details.";
    } else {
      errorMsg += error.message;
    }

    container.innerHTML = `<p style="color: red;">${errorMsg}</p>`;
  }
}
function createSavedJobCard(job, docId) {
  const card = document.createElement("div");
  card.className = "job-card";

  card.innerHTML = `
        <h3>${escapeHtml(job.title)}</h3>
        <p class="company">${escapeHtml(job.company)}</p>
        <p class="location">📍 ${escapeHtml(job.location)}</p>
        <p class="salary">💰 ${escapeHtml(job.salary)}</p>
        <p class="description">${escapeHtml(job.description)}</p>
        <div class="actions">
            <button class="btn-primary" style="background-color: #e74c3c;" onclick="removeSavedJob('${docId}')">
                🗑️ Remove
            </button>
            <a href="${escapeHtml(job.url)}" target="_blank" class="btn-primary">
                Apply →
            </a>
        </div>
    `;

  return card;
}

async function removeSavedJob(docId) {
  if (!confirm("Remove this job from saved?")) return;

  try {
    await db.collection("savedJobs").doc(docId).delete();
    console.log("Job removed:", docId);
    showToast("Job removed from saved!");
    loadSavedJobs();
  } catch (error) {
    console.error("Error removing job:", error);
    showToast("Error removing job. Try again!");
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User authenticated:", user.uid);
    loadSavedJobs();
  } else {
    console.log("No user, redirecting to login");
    window.location.href = "login.html";
  }
});
