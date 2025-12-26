document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const acceptedList = document.getElementById("acceptedList");

  backBtn.addEventListener("click", () => history.back());

  loadAcceptedStays();

  async function loadAcceptedStays() {
    acceptedList.innerHTML = "<p>Loading...</p>";

    try {
      const res = await fetch("https://pgmanagerbackend.onrender.com/otp/pending-acceptd-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!data.requests || data.requests.length === 0) {
        acceptedList.innerHTML = `<p>No active stays found.</p>`;
        return;
      }

      const accepted = data.requests.filter(r => r.status === "ACCEPTED");

      acceptedList.innerHTML = "";

      accepted.forEach(renderCard);

    } catch (err) {
      acceptedList.innerHTML = `<p>Error loading data</p>`;
    }
  }

  function format(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN") + " " + d.toLocaleTimeString("en-IN");
  }

  function renderCard(req) {

    const cityName =
      typeof req.city === "object" && req.city !== null
        ? req.city.name
        : req.city || "N/A";

    // Check leave request exists or not
    const hasLeaveRequest = req.exitRequestDate != null;
    const leaveReqDate = format(req.exitRequestDate);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${req.pgName} (${cityName})</h3>

      <p><b>Owner:</b> ${req.ownerName}</p>
      <p><b>Mobile:</b> ${req.mobile || req.ownerMobile}</p>
      <p><b>Status:</b> <span class="status-badge">Active Stay</span></p>

      ${
        hasLeaveRequest
        ? `<p><b>Leave Request Sent On:</b> ${leaveReqDate}</p>`
        : `<p><b>Leave Request:</b> Not Sent</p>`
      }

      <div class="btn-area"></div>
    `;

    const btnArea = card.querySelector(".btn-area");

    // Leave Request Already Sent
    if (hasLeaveRequest) {

      // Sent button (disabled)
      const sentBtn = document.createElement("button");
      sentBtn.className = "leave-btn";
      sentBtn.textContent = "✔ Leave Request Sent";
      sentBtn.disabled = true;
      btnArea.appendChild(sentBtn);

      // Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "leave-btn cancel-btn";
      cancelBtn.style.background = "#dc2626";
      cancelBtn.style.marginLeft = "10px";
      cancelBtn.textContent = "Cancel Request";

      cancelBtn.addEventListener("click", () =>
        cancelLeaveRequest(req, cancelBtn)
      );

      btnArea.appendChild(cancelBtn);
    }

    // No leave request yet → SEND
    else {

      const sendBtn = document.createElement("button");
      sendBtn.className = "leave-btn";
      sendBtn.textContent = "📝 Send Leave Request";

      sendBtn.addEventListener("click", () =>
        sendLeaveRequest(req, sendBtn)
      );

      btnArea.appendChild(sendBtn);
    }

    acceptedList.appendChild(card);
  }

  // SEND LEAVE REQUEST
  async function sendLeaveRequest(req, btn) {
    const ownerMobile = req.mobile || req.ownerMobile;

    if (!confirm("Do you want to send leave request?")) return;

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      const res = await fetch(
        `https://pgmanagerbackend.onrender.com/otp/send-leave-request?ownerMobile=${ownerMobile}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      alert(data.message || "Leave request sent!");

      loadAcceptedStays(); // reload page state

    } catch (err) {
      alert("Failed to send request");
      btn.disabled = false;
      btn.textContent = "📝 Send Leave Request";
    }
  }

  //  CANCEL LEAVE REQUEST (DELETE)
  async function cancelLeaveRequest(req, cancelBtn) {

    const ownerMobile = req.mobile || req.ownerMobile;

    if (!confirm("Do you want to cancel your leave request?")) return;

    cancelBtn.disabled = true;
    cancelBtn.textContent = "Canceling...";

    try {
      const res = await fetch(
        `https://pgmanagerbackend.onrender.com/otp/delete-leave-request?ownerMobile=${ownerMobile}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      alert(data.message || "Leave request cancelled!");

      loadAcceptedStays(); // reload page state

    } catch (err) {
      alert("Failed to cancel request");
      cancelBtn.disabled = false;
      cancelBtn.textContent = "Cancel Request";
    }
  }

});
