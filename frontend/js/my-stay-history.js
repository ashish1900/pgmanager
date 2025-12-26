document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const list = document.getElementById("historyList");

  backBtn.addEventListener("click", () => {
    history.back();
  });

  loadHistory();

  async function loadHistory() {
    list.innerHTML = `<p>Loading...</p>`;

    try {
      const res = await fetch("https://pgmanagerbackend.onrender.com/otp/pending-acceptd-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.requests || data.requests.length === 0) {
        list.innerHTML = `<p>No history found.</p>`;
        return;
      }

      //  Only show ACCEPTED & REMOVED
      const filtered = data.requests.filter(req =>
        req.status === "ACCEPTED" || req.status === "REMOVED"
      );

      list.innerHTML = "";

      filtered.forEach(req => renderCard(req));

    } catch (err) {
      console.error(err);
      list.innerHTML = `<p>Error loading history</p>`;
    }
  }

  function format(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN") + " " + d.toLocaleTimeString("en-IN");
  }

  function readableStatus(raw) {
    if (raw === "ACCEPTED") return "Active";
    if (raw === "REMOVED") return "Checked Out";
    return raw || "—";
  }

  function renderCard(req) {
    const cityName =
      typeof req.city === "object" && req.city !== null
        ? req.city.name
        : req.city || "N/A";

    const checkInDate = format(req.date);
    const reqDate     = format(req.exitRequestDate);
    const approveDate = format(req.exitAcceptedDate);

    const hasReq      = !!reqDate;
    const hasApprove  = !!approveDate;
    const hasAnyDate  = hasReq || hasApprove;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${req.pgName || "PG Name"} (${cityName})</h3>

      <p><b>Owner:</b> ${req.ownerName || "N/A"}</p>
      <p><b>Mobile:</b> ${req.mobile || req.ownerMobile || "N/A"}</p>

      <p><b>Stay Status:</b> 
        <span class="status ${req.status}">
          ${readableStatus(req.status)}
        </span>
      </p>

      <div class="timeline-box ${hasAnyDate ? "line-strong" : "line-light"}">

        <!-- CHECK-IN ALWAYS STRONG -->
        <div class="timeline-item step-active">
          <div class="timeline-title strong-title">📌 Check-in Date</div>
          <div class="timeline-date strong-date">
            ${checkInDate || "—"}
          </div>
        </div>

        <!-- CHECK-OUT REQUEST -->
        <div class="timeline-item ${hasReq ? "step-active" : "step-inactive"}">
          <div class="timeline-title ${hasReq ? "strong-title" : "light-title"}">
            📤 Check-out Request Date
          </div>
          <div class="timeline-date ${hasReq ? "strong-date" : "light-date"}">
            ${reqDate || "Not Requested"}
          </div>
        </div>

        <!-- CHECK-OUT APPROVAL -->
        <div class="timeline-item ${hasApprove ? "step-active" : "step-inactive"}">
          <div class="timeline-title ${hasApprove ? "strong-title" : "light-title"}">
            ✔ Check-out Approval Date
          </div>
          <div class="timeline-date ${hasApprove ? "strong-date" : "light-date"}">
            ${approveDate || "Pending Approval"}
          </div>
        </div>

      </div>

      <p><b>Uploaded ID:</b> ${req.idType || "—"}</p>

      <div class="id-images">
        ${req.idFront ? `<img class="zoomable" src="https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idFront}">` : ""}
        ${req.idBack  ? `<img class="zoomable" src="https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idBack}">` : ""}
      </div>
    `;

    list.appendChild(card);

    // ⭐ Image zoom functionality
    card.querySelectorAll(".zoomable").forEach(img => {
      img.addEventListener("click", () => openImageViewer(img.src));
    });
  }

  // ⭐ Full screen image viewer
  function openImageViewer(src) {
    const viewer = document.createElement("div");
    viewer.className = "image-viewer";

    viewer.innerHTML = `
      <div class="image-viewer-content">
        <span class="close-viewer">✖</span>
        <img src="${src}">
      </div>
    `;

    document.body.appendChild(viewer);

    viewer.querySelector(".close-viewer").addEventListener("click", () => {
      viewer.remove();
    });
  }
});
