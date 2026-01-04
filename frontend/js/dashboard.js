// 🔥 BACK BUTTON = COMPLETE LOGOUT (JWT INCLUDED)
(function forceLogoutOnBack() {

  // history me dashboard ko lock karo
  window.history.pushState(null, "", window.location.href);

  window.addEventListener("popstate", function () {

    // 🔐 CLEAR AUTH DATA (IMPORTANT)
    localStorage.removeItem("jwtToken");     // ✅ JWT removed
    localStorage.removeItem("currentUser");  // ✅ user data removed
    sessionStorage.clear();                  // ✅ temp / OTP data

    // 🔁 redirect safely (no back / no forward)
    window.location.replace("home.html");
  });

})();



// Modal / UI element refs
const toggleBtn = document.getElementById("toggleDetails");
const guestModal = document.getElementById("guestModal");
const closeModal = document.getElementById("closeModal");

const ownerModal = document.getElementById("ownerModal");
const closeOwnerModal = document.getElementById("closeOwnerModal");
const toggleOwnerBtn = document.getElementById("toggleOwnerDetails");

// Buttons
const findPgBtn = document.getElementById("findPgBtn");

// Dropdown
const pgDropdown = document.getElementById("pgDropdown");

// Local state
let currentGuest = null;
let lastSelectedOwnerMobile = null;
let lastSelectedOwnerId = null; // this is ownerId (Long) used for temp address API

// --- UI handlers ---
if (toggleBtn && guestModal && closeModal) {
  toggleBtn.addEventListener("click", async () => {
    // Before opening guest modal, try fetch temp address (if owner info available)
    const token = localStorage.getItem("jwtToken");
    if (token && currentGuest) {
      // pick selected option ownerId (best effort)
      const selOpt = pgDropdown ? pgDropdown.options[pgDropdown.selectedIndex] : null;
      const ownerIdFromOpt = selOpt ? (selOpt.dataset.ownerId || null) : null;
      const ownerIdToUse = ownerIdFromOpt || lastSelectedOwnerId || null;

      if (ownerIdToUse) {
        // fetch and update tAddress
        await fetchGuestTempAddress(currentGuest.id, ownerIdToUse, token);
      } else {
        // no owner info -> show N/A
        document.getElementById("guestTAddress").textContent = "N/A";
      }
    }

    guestModal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => guestModal.classList.add("hidden"));
  window.addEventListener("click", e => { if (e.target === guestModal) guestModal.classList.add("hidden"); });
}

if (toggleOwnerBtn && ownerModal && closeOwnerModal) {
  toggleOwnerBtn.addEventListener("click", () => ownerModal.classList.remove("hidden"));
  closeOwnerModal.addEventListener("click", () => ownerModal.classList.add("hidden"));
  window.addEventListener("click", e => { if (e.target === ownerModal) ownerModal.classList.add("hidden"); });
}
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {

    // 🔥 Clear ALL auth & user related data
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("currentUser");

    sessionStorage.clear(); // OTP / temp data

    // 🔁 Redirect safely (no back)
    window.location.replace("home.html");
  });
}


if (findPgBtn) {
  findPgBtn.addEventListener("click", () => {
    window.location.href = "find-pg.html";
  });
}

const paymentBtn = document.querySelector(".blue");
if (paymentBtn) {
  paymentBtn.addEventListener("click", () => {
    window.location.href = "paymentG.html";
  });
}

// Payment History Button → open new page
const historyBtn = document.querySelector(".green");
historyBtn.addEventListener("click", () => {
  window.location.href = "payment-historyG.html";
});

// Stay History Button → open new page
const stayHistoryBtn = document.querySelector(".yellow");
stayHistoryBtn.addEventListener("click", () => {
  window.location.href = "my-stay-history.html";
});


// Stay History Button → open new page
const sendLeaveRequestBtn = document.querySelector(".purple");
sendLeaveRequestBtn.addEventListener("click", () => {
  window.location.href = "leave-request.html";
});



// --- Helper: safe fetch wrapper ---
async function safeFetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// --- Fetch current guest details (without tAddress) ---
async function fetchGuestDetails(token) {
  try {
    const data = await safeFetchJson("https://pgmanagerbackend.onrender.com/otp/current-guest", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const g = data.guestData || data.guest || null;
    if (!g) {
      console.warn("fetchGuestDetails: guest data missing", data);
      return;
    }
    currentGuest = g;

    document.getElementById("guestName").textContent = g.name || "N/A";
    document.getElementById("guestMobile").textContent = g.moNumber || "N/A";
    document.getElementById("guestTAddress").textContent = "N/A"; // placeholder until owner known
    document.getElementById("guestPAddress").textContent = g.pAddress || g.paddress || "N/A";
    document.getElementById("modalGuestName").textContent = g.name || "N/A";

   if (data.profileImageUrl) {
  document.getElementById("profileImage").src = data.profileImageUrl;
  document.getElementById("modalProfileImage").src = data.profileImageUrl;
}


  } catch (err) {
    console.error("fetchGuestDetails failed:", err);
    throw err;
  }
}

// --- Fetch temporary address (guestId + ownerId) ---
async function fetchGuestTempAddress(guestId, ownerId, token) {
  if (!guestId || !ownerId) {
    console.warn("fetchGuestTempAddress: missing guestId or ownerId", guestId, ownerId);
    document.getElementById("guestTAddress").textContent = "N/A";
    return;
  }

  try {
    const url = `https://pgmanagerbackend.onrender.com/otp/guest-temp-address?guestId=${guestId}&ownerId=${ownerId}`;
    const data = await safeFetchJson(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (data && (data.status === "success" || data.status === "ok") && data.tAddress) {
      document.getElementById("guestTAddress").textContent = data.tAddress;
    } else {
      // API returns fail or no tAddress
      document.getElementById("guestTAddress").textContent = data.tAddress || "N/A";
    }
  } catch (err) {
    console.error("Failed to fetch temp address:", err);
    document.getElementById("guestTAddress").textContent = "N/A";
  }
}

// --- Load accepted PGs into dropdown ---
// Important: we store ownerMobile in value (for fetchOwnerDetails endpoint) and ownerId in dataset.ownerId (for guest-temp-address endpoint)
async function loadAcceptedPGs(token) {
  try {
    const data = await safeFetchJson("https://pgmanagerbackend.onrender.com/otp/accepted-pgs", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    pgDropdown.innerHTML = "";

    if (!(data && data.status === "success" && Array.isArray(data.acceptedPgs))) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No PGs";
      pgDropdown.appendChild(opt);
      return;
    }

    const list = data.acceptedPgs;
    if (list.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No PGs";
      pgDropdown.appendChild(opt);
      return;
    }

    list.forEach((pg) => {
      const opt = document.createElement("option");
      // keep value as ownerMobile for owner-details endpoint compatibility
      opt.value = pg.ownerMobile || "";
      // store ownerId separately for temp-address API (USE THIS for fetchGuestTempAddress)
      // your backend response should include ownerId (e.g., pg.ownerId or pg.owner.id)
      opt.dataset.ownerId = (pg.ownerId || (pg.owner && pg.owner.id) || "") ;
      opt.textContent = `${pg.pgName || "Unnamed PG"} (${pg.city || "N/A"})`;
      opt.dataset.pgName = pg.pgName || "";
      opt.dataset.city = pg.city || "";
      pgDropdown.appendChild(opt);
    });

    // default select first
    pgDropdown.selectedIndex = 0;
    const firstOpt = pgDropdown.options[pgDropdown.selectedIndex];
    if (firstOpt) {
      document.getElementById("ownerPgName").textContent = firstOpt.dataset.pgName || firstOpt.text;

      const ownerMobile = firstOpt.value || null;
      const ownerIdCandidate = firstOpt.dataset.ownerId || null;

      if (ownerMobile) {
        // keep lastSelectedOwnerMobile for owner-details fetch
        lastSelectedOwnerMobile = ownerMobile;
        await fetchOwnerDetailsAndMaybeTemp(token, ownerMobile, ownerIdCandidate);
      } else {
        document.getElementById("ownerPgName").textContent = firstOpt.text;
      }
    }

    // on dropdown change
    pgDropdown.addEventListener("change", async (e) => {
      const opt = e.target.options[e.target.selectedIndex];
      const ownerMobile = opt ? opt.value : "";
      const ownerId = opt ? (opt.dataset.ownerId || "") : "";
      const pgName = opt ? (opt.dataset.pgName || opt.text) : "PG Manager";
      document.getElementById("ownerPgName").textContent = pgName;

      if (ownerMobile) {
        lastSelectedOwnerMobile = ownerMobile;
        await fetchOwnerDetailsAndMaybeTemp(token, ownerMobile, ownerId);
         await loadGuestNoticesForSelectedPG();
      } else {
        lastSelectedOwnerMobile = null;
        lastSelectedOwnerId = null;
        document.getElementById("guestTAddress").textContent = "N/A";
      }
    });

  } catch (err) {
    console.error("loadAcceptedPGs failed:", err);
    pgDropdown.innerHTML = `<option value="">Error loading PGs</option>`;
  }
}

// --- Fetch owner details and then attempt to fetch temp address (ownerMobile is for owner-details endpoint,
// ownerIdCandidate is optional ownerId to use for guest-temp-address) ---
async function fetchOwnerDetailsAndMaybeTemp(token, ownerMobile, ownerIdCandidate) {
  try {
    await fetchOwnerDetails(token, ownerMobile);

    // If repository/accepted-pgs provided ownerId in dataset use it, otherwise try ownerDetails.id
    const opt = pgDropdown.options[pgDropdown.selectedIndex];
    let ownerId = ownerIdCandidate || (opt ? opt.dataset.ownerId : null);

    // If fetchOwnerDetails returned ownerDetails with id, we prefer that:
    // (fetchOwnerDetails stores owner id into lastSelectedOwnerId if available)
    if (lastSelectedOwnerId) {
      ownerId = lastSelectedOwnerId;
    }

    // If ownerId is still missing, try to extract from ownerDetails returned by owner-details endpoint (if present)
    // fetchOwnerDetails sets lastSelectedOwnerId to o.id if present.

    // Now call temp address only if we have ownerId and guest
    if (currentGuest && currentGuest.id && ownerId) {
      await fetchGuestTempAddress(currentGuest.id, ownerId, token);
    } else {
      // if ownerId missing, clear temp address
      document.getElementById("guestTAddress").textContent = "N/A";
    }
  } catch (err) {
    console.error("fetchOwnerDetailsAndMaybeTemp failed:", err);
  }
}







// --- Fetch owner details by ownerMobile (existing endpoint) ---
async function fetchOwnerDetails(token, ownerMobile) {
  if (!ownerMobile) return;
  try {
    const url = `https://pgmanagerbackend.onrender.com/otp/owner-details?ownerMobile=${encodeURIComponent(ownerMobile)}`;
    const data = await safeFetchJson(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!(data && data.status === "success" && data.ownerDetails)) return;

    const o = data.ownerDetails;
    document.getElementById("ownerName").textContent = o.name || "N/A";
    document.getElementById("ownerMobile").textContent = o.moNumber || "N/A";
    document.getElementById("modalPgName").textContent = o.pgName || "N/A";
    document.getElementById("ownerCity").textContent = (o.city && o.city.name) ? o.city.name : "N/A";
    document.getElementById("ownerAddress").textContent = o.address || "N/A";

    // store owner id if returned by owner-details endpoint (so temp-address can use it)
    if (o.id) {
      lastSelectedOwnerId = o.id;
      // Also update the selected option dataset.ownerId so future calls can use it
      const opt = pgDropdown ? pgDropdown.options[pgDropdown.selectedIndex] : null;
      if (opt) opt.dataset.ownerId = o.id;
    }

    if (data.roomAssignment) {
      document.getElementById("assignedBuilding").textContent = data.roomAssignment.buildingNumber || "N/A";
      document.getElementById("assignedRoom").textContent = data.roomAssignment.roomNumber || "N/A";
      document.getElementById("assignedRoomAddress").textContent = data.roomAssignment.address || "N/A";
      document.getElementById("assignedFloor").textContent = data.roomAssignment.floorNumber || "N/A";
    } else {
      document.getElementById("assignedBuilding").textContent = "—";
      document.getElementById("assignedRoom").textContent = "—";
      document.getElementById("assignedRoomAddress").textContent = "—";
      document.getElementById("assignedFloor").textContent = "—";
    }

    // owner image
    if (o.moNumber) {
      try {
        const profileImageUrl = `https://pgmanagerbackend.onrender.com/otp/profileImage?ownerMobile=${encodeURIComponent(o.moNumber)}`;
        const imgRes = await fetch(profileImageUrl, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          document.getElementById("ownerImage").src = URL.createObjectURL(blob);
        } else {
          document.getElementById("ownerImage").src = "../images/default-avatar.png";
        }
      } catch (err) {
        console.warn("owner image fetch failed", err);
        document.getElementById("ownerImage").src = "../images/default-avatar.png";
      }
    }

  } catch (err) {
    console.error("fetchOwnerDetails failed:", err);
    throw err;
  }
}










// --- Update Profile Modal refs ---
const updateProfileBtn = document.getElementById("updateProfileBtn");
const updateGuestModal = document.getElementById("updateGuestModal");
const closeUpdateModalBtn = document.getElementById("closeUpdateModal");
const updateGuestForm = document.getElementById("updateGuestForm");

// --- Open modal ---
updateProfileBtn?.addEventListener("click", async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/check-update-eligibility", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.status === "eligible") {
      // Pre-fill current details
      document.getElementById("updateName").value = currentGuest.name || "";
      document.getElementById("updatePAddress").value = currentGuest.pAddress || "";
      updateGuestModal.classList.remove("hidden");
    } else if (data.status === "ineligible") {
      alert(data.message);
    } else {
      alert("Unable to check eligibility. Try again later.");
    }
  } catch (err) {
    console.error("Eligibility check failed:", err);
    alert("Error checking eligibility. Try again later.");
  }
});

// --- Close modal safely ---
const closeUpdateModal = () => {
  if (updateGuestModal) updateGuestModal.classList.add("hidden");
};

// Close button
closeUpdateModalBtn?.addEventListener("click", closeUpdateModal);

// Click outside modal content
updateGuestModal?.addEventListener("click", (e) => {
  if (e.target === updateGuestModal) closeUpdateModal();
});

// --- Form submit ---
updateGuestForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("updateName").value.trim();
  const pAddress = document.getElementById("updatePAddress").value.trim();
  const profileImage = document.getElementById("updateImage").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("pAddress", pAddress);
  if (profileImage) formData.append("profileImage", profileImage);

  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/update-details", {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (data.status === "success") {
      alert(data.message);
      closeUpdateModal();

      // Update UI
      currentGuest.name = name;
      currentGuest.pAddress = pAddress;
      document.getElementById("guestName").textContent = name;
      document.getElementById("guestPAddress").textContent = pAddress;
      document.getElementById("modalGuestName").textContent = name;

      if (profileImage) {
        const imgUrl = URL.createObjectURL(profileImage);
        document.getElementById("profileImage").src = imgUrl;
        document.getElementById("modalProfileImage").src = imgUrl;
      }
    } else {
      alert(data.message || "Update failed");
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert("Update failed. Try again later.");
  }
});



// === Live Image Preview Feature ===
const updateImageInput = document.getElementById("updateImage");
const previewContainer = document.getElementById("imagePreviewContainer");
const previewImage = document.getElementById("selectedImagePreview");
const fileNameText = document.getElementById("selectedFileName");

updateImageInput?.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // Show file name
    fileNameText.textContent = `Selected: ${file.name}`;

    // Create a temporary preview URL
    const imgUrl = URL.createObjectURL(file);
    previewImage.src = imgUrl;

    // Display the preview container
    previewContainer.style.display = "block";
  } else {
    // Hide preview if no image selected
    previewContainer.style.display = "none";
    fileNameText.textContent = "";
    previewImage.src = "";
  }
});







// --- Main init ---
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
     window.location.replace("home.html");
    return;
  }

  try {
    await fetchGuestDetails(token);
    await loadAcceptedPGs(token);

    await loadGuestNoticesForSelectedPG();


  } catch (err) {
    console.error("Initialization failed:", err);
    alert("Session invalid. Please login again.");
    localStorage.removeItem("jwtToken");
    window.location.href = "login.html";
  }
});














// ===============================
// GUEST DASHBOARD – LOAD NOTICES
// Based on selected PG (ownerMobile)
// ===============================

async function loadGuestNoticesForSelectedPG() {

  const token = localStorage.getItem("jwtToken");
  const list = document.getElementById("guestNoticeList");
  const pgDropdown = document.getElementById("pgDropdown");

  if (!token || !list || !pgDropdown) return;

  const ownerMobile = pgDropdown.value;

  // ❌ No PG selected
  if (!ownerMobile) {
    list.innerHTML = "<li>Select a PG to see notices</li>";
    return;
  }

  try {
    const res = await fetch(
      `https://pgmanagerbackend.onrender.com/otp/guest/notices?ownerMobile=${encodeURIComponent(ownerMobile)}`,
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const notices = await res.json();
    list.innerHTML = "";

    // ❌ No notices OR not accepted guest
    if (!Array.isArray(notices) || notices.length === 0) {
      list.innerHTML = "<li>No notices available</li>";
      return;
    }

    // ✅ Render notices
    notices.forEach(n => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${n.message}
        <time style="display:block;font-size:12px;color:#6b7280;">
          ${new Date(n.updatedAt).toLocaleString()}
        </time>
      `;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load guest notices", err);
    list.innerHTML = "<li>Error loading notices</li>";
  }
}
