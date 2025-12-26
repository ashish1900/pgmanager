let currentRequestData = null;

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
    window.location.href = "login.html";
    return;
  }

  fetchRequestsList(token);
});



function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return { date: "-", time: "-" };

  const d = new Date(dateTimeStr);

  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  };
}




// ✅ Fetch Pending Requests
function fetchRequestsList(token) {
  fetch("https://pgmanagerbackend.onrender.com/otp/guest-requests", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("pendingRequestsBody");
    tbody.innerHTML = "";

    if (data.status === "success" && data.requests.length > 0) {

  // ⭐ LATEST REQUEST FIRST (DESC SORT)
  data.requests.sort((a, b) => {
    return new Date(b.requestDate) - new Date(a.requestDate);
  });

  data.requests.forEach((req, index) => {

    

        const tr = document.createElement("tr");

        const { date, time } = formatDateTime(req.requestDate);


        tr.innerHTML = `
          <td>${index + 1}</td>
          <td><img class="guest-img"
            src="https://pgmanagerbackend.onrender.com/otp/profileImageG?guestMobile=${req.guestMobile}"></td>
          <td>${req.guestName}</td>
          <td>
             ${date}<br>
               <span style="font-size:12px;color:#777;">${time}</span>
          </td>
          <td>${req.guestMobile}</td>
          <td>${req.taddress || "N/A"}</td>
          <td>${req.paddress}</td>
          <td>
            <button class="accept-btn"
              onclick='openVerifyModal(${JSON.stringify(req)})'>View & Verify</button>
            <button class="reject-btn"
              onclick="rejectRequest(${req.requestId})" style=Display:none>Reject</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="7">No pending requests</td></tr>`;
    }
  });
}

// ✅ Step 1: Open Verification Modal
function openVerifyModal(req) {
  currentRequestData = req;
  document.getElementById("verifyModal").style.display = "flex";

  document.getElementById("vGuestName").textContent = req.guestName;
  document.getElementById("vGuestMobile").textContent = req.guestMobile;
  document.getElementById("vGuestTAddress").textContent = req.taddress;
  document.getElementById("vGuestPAddress").textContent = req.paddress;

  // ID images
  document.getElementById("idFrontImage").src =
    `https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idFront}`;
  document.getElementById("idBackImage").src =
    `https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${req.idBack}`;
}

// ✅ Accept → Open Assign Room Modal
function verified() {
  closeVerifyModal();
  openAssignModal(currentRequestData);
}

// ❌ ID & Details Mismatch (Modal)
function idMismatch() {
  const token = localStorage.getItem("jwtToken");

  fetch(`https://pgmanagerbackend.onrender.com/otp/mismatch-request/${currentRequestData.requestId}`, {
    method: 'PATCH',  // 
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    alert("❌ Guest notified: ID & Details mismatch.");
    fetchRequestsList(token);   // Table refresh
    closeVerifyModal();
  })
  .catch(err => console.error(err));
}



// ❌ Reject (Table button)
function rejectRequest(requestId) {
  const token = localStorage.getItem("jwtToken");
  fetch(`https://pgmanagerbackend.onrender.com/otp/reject-request/${requestId}`, {
    method: 'DELETE',
    headers: { "Authorization": `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Request deleted for you.");
    fetchRequestsList(token);
  })
  .catch(err => console.error(err));
}

// Close Verify Modal
function closeVerifyModal() {
  document.getElementById("verifyModal").style.display = "none";
}

// ✅ Open Assign Room Modal
function openAssignModal(req) {
  if (!req) return;

  document.getElementById("assignModal").style.display = "flex";

  document.getElementById("currentRequestId").value = req.requestId;
  document.getElementById("currentGuestMobile").value = req.guestMobile;

  // ✅ Assign header data
  document.getElementById("guestName").textContent = req.guestName;

  const img = document.getElementById("assignGuestImage");
  img.src = `https://pgmanagerbackend.onrender.com/otp/profileImageG?guestMobile=${req.guestMobile}`;
  img.onerror = () => img.src = "default-avatar.png";
}


// Close Assign Modal
function closeAssignModal() {
  document.getElementById("assignModal").style.display = "none";
}

// Enable Assign button only if all fields filled
function validateForm() {
  const roomNumber = document.getElementById("roomNumber").value.trim();
  const floorNumber = document.getElementById("floorNumber").value.trim();
  const buildingNumber = document.getElementById("buildingNumber").value.trim();
  const roomAddress = document.getElementById("roomAddress").value.trim();

  document.getElementById("assignBtn").disabled =
    !(roomNumber && floorNumber && buildingNumber && roomAddress);
}

// ✅ Submit Assign Room (Controller-based update)
function submitAssignment() {
  const token = localStorage.getItem("jwtToken");
  const requestId = document.getElementById("currentRequestId").value;

  const payload = {
    roomNumber: document.getElementById("roomNumber").value.trim(),
    floorNumber: document.getElementById("floorNumber").value.trim(),
    buildingNumber: document.getElementById("buildingNumber").value.trim(),
    address: document.getElementById("roomAddress").value.trim()
  };

  fetch(`https://pgmanagerbackend.onrender.com/otp/accept-and-assign/${requestId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("✅ " + data.message);
        closeAssignModal();
        fetchRequestsList(token);
      } else {
        alert("⚠️ " + data.message);
      }
    })
    .catch(err => {
      console.error("Assign Room Error:", err);
      alert("❌ Something went wrong. Please try again.");
    });
}


function openImageZoom(src) {
  const modal = document.getElementById("imageZoomModal");
  const img = document.getElementById("zoomedImage");

  img.src = src;
  modal.style.display = "flex";
}

function closeImageZoom() {
  document.getElementById("imageZoomModal").style.display = "none";
}
