document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => history.back());

  const findPgBtn = document.getElementById("findPgBtn");
  const findPgModal = document.getElementById("findPgModal");
  const closeFindPgModal = document.getElementById("closeFindPgModal");
  const citySelect = document.getElementById("citySelect");
  const pgListContainer = document.getElementById("pgListContainer");
  const pgList = document.getElementById("pgList");
  const idUploadModal = document.getElementById("idUploadModal");
  const closeIdModal = document.getElementById("closeIdModal");
  const idUploadForm = document.getElementById("idUploadForm");
  const myRequestsSection = document.getElementById("myRequestsSection");
  const myRequestsList = document.getElementById("myRequestsList");

  const idFrontInput = document.getElementById("idFront");
  const idBackInput = document.getElementById("idBack");
  const frontPreview = document.getElementById("frontPreview");
  const backPreview = document.getElementById("backPreview");

  const imageViewer = document.getElementById("imageViewer");
  const viewerImage = document.getElementById("viewerImage");
  const closeImageViewer = document.getElementById("closeImageViewer");

  let selectedPgId = null;

  // ---------------- Load previous requests on page load ----------------
  fetchGuestRequests();

  async function fetchGuestRequests() {
    try {
      const res = await fetch("https://pgmanagerbackend.onrender.com/otp/pending-acceptd-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const valid = (data.requests || []).filter(r =>
        r.status === "PENDING" || r.status === "ACCEPTED"
      );

      if (valid.length > 0) {
        myRequestsSection.style.display = "block";
        myRequestsList.innerHTML = "";
        valid.forEach(addRequestCard);
      } else {
        myRequestsSection.style.display = "none";
      }

    } catch (err) {
      console.error("Failed to fetch requests:", err);
      myRequestsSection.style.display = "none";
    }
  }

  // ⭐ SHOW REQUEST CARD + CANCEL BUTTON FOR PENDING
  function addRequestCard(req) {

    const cityName =
      typeof req.city === "object" && req.city !== null
        ? req.city.name
        : req.city || "Unknown";

    const date = req.date || new Date().toISOString();

    const statusText = req.status || "PENDING";
    const statusClass =
      statusText === "ACCEPTED" ? "status-accepted" : "status-pending";

    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h4>${req.pgName} (${cityName})</h4>
      <p><b>Owner:</b> ${req.ownerName}</p>
      <p style=display:none><b>Mobile:</b> ${req.mobile || req.ownerMobile}</p>
      <p><b>Status:</b> 
        <span class="status-badge ${statusClass}">
          ${statusText}
        </span>
      </p>
      <p><b>Date:</b> ${new Date(date).toLocaleString()}</p>

      <div class="id-images">
        ${req.idFront ? `<img src="https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idFront}">` : ""}
        ${req.idBack ? `<img src="https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idBack}">` : ""}
      </div>

      <div class="btn-area"></div>
    `;

    const btnArea = card.querySelector(".btn-area");

    // ⭐ CANCEL BUTTON only for PENDING
    if (statusText === "PENDING") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "delete-btn";
      cancelBtn.textContent = "❌ Cancel Request";

      cancelBtn.addEventListener("click", () => cancelRequest(req, cancelBtn));

      btnArea.appendChild(cancelBtn);
    }

    // ⭐ Image zoom on click (request cards)
    card.querySelectorAll(".id-images img").forEach(img => {
      img.addEventListener("click", () => openImageViewer(img.src));
    });

    myRequestsList.appendChild(card);
  }

  // ⭐ CANCEL REQUEST FUNCTION
  async function cancelRequest(req, btn) {

    const ownerMobile = req.mobile || req.ownerMobile;

    if (!confirm("Do you want to cancel this PG request?")) return;

    btn.disabled = true;
    btn.textContent = "Cancelling...";

    try {
      const res = await fetch(
        `https://pgmanagerbackend.onrender.com/otp/delete-pg-request?ownerMobile=${ownerMobile}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      alert(data.message || "Request deleted!");

      fetchGuestRequests(); // refresh UI

    } catch (err) {
      alert("Failed to delete request");
      btn.disabled = false;
      btn.textContent = "❌ Cancel Request";
    }
  }

  // ---------------- Find PG Modal ----------------
  findPgBtn.addEventListener("click", async () => {
    resetFindPgModal();
    findPgModal.classList.remove("hidden");
    await loadCities();
  });

  closeFindPgModal.addEventListener("click", () => {
    findPgModal.classList.add("hidden");
    resetFindPgModal();
  });

  function resetFindPgModal() {
    citySelect.value = "";
    pgList.innerHTML = "";
    pgListContainer.style.display = "none";
  }

  async function loadCities() {
    try {
      const res = await fetch("https://pgmanagerbackend.onrender.com/otp/cities");
      const data = await res.json();

      citySelect.innerHTML = `<option value="">--Select City--</option>`;
      data.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.name;
        opt.textContent = city.name;
        citySelect.appendChild(opt);
      });

    } catch {
      alert("Failed to load cities");
    }
  }

  // ---------------- PG List by City ----------------
  citySelect.addEventListener("change", async () => {

    const city = citySelect.value;

    if (!city) {
      pgListContainer.style.display = "none";
      return;
    }

    pgListContainer.style.display = "block";
    pgList.innerHTML = `<p>Loading PGs...</p>`;

    try {
      const res = await fetch(
        `https://pgmanagerbackend.onrender.com/otp/pg-by-city?city=${encodeURIComponent(city)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      pgList.innerHTML = "";

      if (data.status === "success" && data.pgs.length > 0) {

        data.pgs.forEach(pg => {
          const card = document.createElement("div");
          card.className = "pg-card";

          card.innerHTML = `
            <h3>${pg.pgName}</h3>
            <p><b>Address:</b> ${pg.pgAddress}</p>
            <p><b>Owner:</b> ${pg.ownerName}</p>

            <button class="sendReqBtn" data-id="${pg.pgId}">
              Send Request
            </button>
          `;

          pgList.appendChild(card);
        });

        // Click handler
        document.querySelectorAll(".sendReqBtn").forEach(btn => {
          btn.addEventListener("click", e => {
            selectedPgId = e.target.dataset.id;
            resetIdModal();
            findPgModal.classList.add("hidden");
            idUploadModal.classList.remove("hidden");
          });
        });

      } else {
        pgList.innerHTML = `<p>No PGs found</p>`;
      }

    } catch {
      pgList.innerHTML = `<p>Error loading PGs</p>`;
    }
  });

  function resetIdModal() {
    idUploadForm.reset();
    frontPreview.innerHTML = "";
    backPreview.innerHTML = "";
  }

  closeIdModal.addEventListener("click", () => {
    idUploadModal.classList.add("hidden");
    resetIdModal();
    findPgModal.classList.remove("hidden");
  });

  // ---------------- IMAGE PREVIEW FOR ID UPLOAD ----------------
  setupPreview(idFrontInput, frontPreview);
  setupPreview(idBackInput, backPreview);

  function setupPreview(inputEl, previewEl) {
    inputEl.addEventListener("change", () => {
      const file = inputEl.files[0];
      if (!file) {
        previewEl.innerHTML = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        previewEl.innerHTML = `<img src="${e.target.result}" alt="ID Preview">`;
        // zoom on preview too
        const img = previewEl.querySelector("img");
        img.addEventListener("click", () => openImageViewer(e.target.result));
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------------- IMAGE VIEWER ----------------
  function openImageViewer(src) {
    viewerImage.src = src;
    imageViewer.classList.remove("hidden");
  }

  closeImageViewer.addEventListener("click", () => {
    imageViewer.classList.add("hidden");
    viewerImage.src = "";
  });

  imageViewer.addEventListener("click", (e) => {
    if (e.target === imageViewer) {
      imageViewer.classList.add("hidden");
      viewerImage.src = "";
    }
  });

  // ---------------- Submit ID Upload ----------------
  idUploadForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (!selectedPgId) {
      alert("Select PG first");
      return;
    }

    const formData = new FormData();
    formData.append("idType", document.getElementById("idType").value);
    formData.append("idFront", document.getElementById("idFront").files[0]);
    formData.append("idBack", document.getElementById("idBack").files[0]);
    formData.append("tempAddress", document.getElementById("tempAddress").value);
    formData.append("ownerId", selectedPgId);

    try {
      const res = await fetch("https://pgmanagerbackend.onrender.com/otp/sendRequest-with-id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Request sent!");

      idUploadModal.classList.add("hidden");
      resetIdModal();
      findPgModal.classList.remove("hidden");

      selectedPgId = null;
      fetchGuestRequests();

    } catch {
      alert("Failed to send request");
    }
  });




});
