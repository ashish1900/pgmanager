const token = localStorage.getItem("jwtToken");

let ownerId = null;

async function initOwnerId() {
  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/current-user", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();

    if (!data.userData || !data.userData.id) {
      throw new Error("Owner ID missing");
    }

    ownerId = data.userData.id;

    //  sync localStorage (future pages ke liye)
    localStorage.setItem("currentUser", JSON.stringify(data.userData));

  } catch (err) {
    alert("Session error. Please login again.");
    logout();   
  }
}


const currentUserData = localStorage.getItem("currentUser");
if (currentUserData) {
  try {
    const parsed = JSON.parse(currentUserData);
    ownerId = parsed.id;
  } catch (e) {
    console.error("Error parsing currentUser:", e);
  }
}

let paymentType = localStorage.getItem("selectedPaymentType");
let paymentList = [];

//  Heading and browser title update
document.addEventListener("DOMContentLoaded", () => {
  const pageTitle = document.querySelector("h1");
  const browserTitle = document.querySelector("title");

  let displayType = paymentType ? paymentType.replace(/_/g, " ") : "Room Rent";
  displayType = displayType
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  pageTitle.textContent = `${displayType} Payment History`;
  browserTitle.textContent = `${displayType} Payment History`;
});

//  Token check
if (!token) {
  alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
  window.location.href = "login.html";
}

// =============================
//  DOM Events
// =============================
document.addEventListener("DOMContentLoaded", async () => {

  await initOwnerId();   //  MOST IMPORTANT

  document.getElementById("saveUpiBtn").addEventListener("click", uploadUPI);
  document.getElementById("updateUpiBtn").addEventListener("click", showUpiSetup);

  loadUPI();
  loadRoomRentPayments();
  setupFilterButtons();
});



const BASE_URL = "https://pgmanagerbackend.onrender.com/otp";

function resolveUrl(url) {
  if (!url) return "/images/default.png";

  //  Cloudinary signed URL
  if (url.startsWith("http")) {
    return url;
  }

  //  Local backend path
  return BASE_URL + url;
}



// =============================
//  Upload / Update UPI + QR
// =============================
function uploadUPI(e) {
  e.preventDefault();

  if (!ownerId) {
    alert("Owner ID not found. Please login again.");
    return;
  }

  const upiId = document.getElementById("upiIdInput").value.trim();
  const qrFile = document.getElementById("qrUpload").files[0];

    //  Safety check again
  if (qrFile && qrFile.size > 1024 * 1024) {
    alert("QR image size must be less than 1 MB.");
    return;
  }



  if (!upiId) {
    alert("Please enter a valid UPI ID.");
    return;
  }

  const formData = new FormData();
  formData.append("upiId", upiId);
  if (qrFile) formData.append("qrFile", qrFile);

  fetch(`https://pgmanagerbackend.onrender.com/otp/upload/${ownerId}/${paymentType}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.upiId) {
        alert("✅ UPI & QR updated successfully!");
        loadUPI();
      } else {
        alert("❌ Failed to update UPI/QR. Please try again.");
      }
    })
    .catch(err => {
      console.error("Upload error:", err);
      alert("Error uploading UPI/QR.");
    });
}





// =============================
//  Load Existing UPI Data
// =============================
function loadUPI() {
  if (!ownerId) return;

  fetch(`https://pgmanagerbackend.onrender.com/otp/payment-method/${ownerId}/${paymentType}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const upiDisplay = document.getElementById("upiDisplay");
      const qrDisplayImg = document.getElementById("qrDisplayImg");
      const currentInfo = document.getElementById("currentUpiInfo");
      const setupSection = document.getElementById("upiSetupSection");

      if (data && data.upiId) {
        upiDisplay.textContent = data.upiId || "Not available";
        qrDisplayImg.src = data.qrCodeUrl || "";
        qrDisplayImg.style.display = data.qrCodeUrl ? "block" : "none";
        setupSection.classList.add("hidden");
        currentInfo.classList.remove("hidden");
      } else {
        setupSection.classList.remove("hidden");
        currentInfo.classList.add("hidden");
      }
    })
    .catch(err => console.error("Error fetching UPI:", err));
}

// =============================
//  Show setup section for update
// =============================
function showUpiSetup() {
  document.getElementById("upiSetupSection").classList.remove("hidden");
  document.getElementById("currentUpiInfo").classList.add("hidden");
}

// =============================
//  Load Payment History
// =============================
function loadRoomRentPayments() {
  fetch("https://pgmanagerbackend.onrender.com/otp/payment-historyO", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      paymentList = (data.history || data.payments || []).filter(p => p.type === paymentType);

      // Default: Verified filter apply
      const verifiedBtn = document.querySelector('.filter-btn[data-status="Verified"]');
      if (verifiedBtn) {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        verifiedBtn.classList.add("active");
        applyPaymentFilter("Verified");
      } else {
        renderTable(paymentList);
      }
    })
    .catch(err => {
      console.error("Error loading payments:", err);
      document.getElementById("paymentHistoryContainer").innerHTML =
        "<p>Error loading payment history.</p>";
    });
}

// =============================
//  Render Table with Numbering
// =============================
function renderTable(list) {
  const container = document.getElementById("paymentHistoryContainer");

  if (!list || list.length === 0) {
    container.innerHTML = "<p>No payment history found.</p>";
    return;
  }

  let html = `
    <table class="payment-history">

      <thead>
        <tr>
          <th>#</th>
          <th>Guest Name</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Payment Date</th>
          <th>Verified Date</th>
          <th>Status</th>
          <th>Receipt</th>
        </tr>
      </thead>
      <tbody>
      


      
  `;

  


  //  First time count update
document.getElementById("countAll").textContent = paymentList.length;
document.getElementById("countVerified").textContent =
  paymentList.filter(p => p.status === "Verified").length;
document.getElementById("countRejected").textContent =
  paymentList.filter(p => p.status === "Rejected").length;


  list.forEach((p, rowIndex) => {
  //  const payDate = p.paymentDate ? new Date(p.paymentDate).toLocaleString("en-IN") : "—";
//    const verifiedDate = p.verifiedDate ? new Date(p.verifiedDate).toLocaleString("en-IN") : "—";



function formatStackDate(dateString) {
  if (!dateString) return "—";

  const d = new Date(dateString);

  //   Day Month Year → 25 Nov 2025
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  const datePart = `${day} ${month} ${year}`;

  //  Time → 10:21 PM
  const timePart = d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `${datePart}<br><small>${timePart}</small>`;
}







    //  original index in main paymentList – so modal sahi guest show kare
    const originalIndex = paymentList.indexOf(p);

    html += `
      <tr>
        <td>${rowIndex + 1}</td>
        <td>
          ${p.guestName || "—"}<br>
          <button class="see-btn" data-index="${originalIndex}">See</button>
        </td>
        <td>${p.type || "—"}</td>
        <td>₹${p.amount || 0}</td>
        <td>${formatStackDate(p.paymentDate)}</td>

        <td>${formatStackDate(p.verifiedDate)}</td>

        <td class="${p.status === "Verified" ? "status-paid" : "status-pending"}">
          ${p.status || "Pending"}
        </td>
        
         

        <td>
  <img src="${resolveUrl(p.receiptUrl)}"
       class="receipt-img"
       alt="Receipt"
       width="60"
       height="60"
       style="cursor:zoom-in;border-radius:6px;">
</td>



      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  enableFullImageZoom(".receipt-img");

  // Attach See button click
  document.querySelectorAll(".see-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-index"));
      openInfoModal(index);
    });
  });
}



// =============================
//  Payment Filter Logic
// =============================
function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedStatus = btn.dataset.status;
      applyPaymentFilter(selectedStatus);
    });
  });
}



function applyPaymentFilter(status) {

  // Always update count from full list (never from filtered)
  document.getElementById("countAll").textContent = paymentList.length;
  document.getElementById("countVerified").textContent =
    paymentList.filter(p => p.status === "Verified").length;
  document.getElementById("countRejected").textContent =
    paymentList.filter(p => p.status === "Rejected").length;

  let filtered = [];

  if (status === "All") {
    filtered = paymentList;
  } else {
    filtered = paymentList.filter(
      p => (p.status || "").toLowerCase() === status.toLowerCase()
    );
  }

  //  Sort latest verified date first
  filtered.sort((a, b) => {
    const t1 = a.verifiedDate ? new Date(a.verifiedDate).getTime() : 0;
    const t2 = b.verifiedDate ? new Date(b.verifiedDate).getTime() : 0;
    return t2 - t1;
  });

  renderTable(filtered);
}






// =============================
//  Guest Info Modal Logic
// =============================
async function openInfoModal(index) {
  const g = paymentList[index];
  if (!g) return;

  const modal = document.getElementById("infoModal");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);

  document.getElementById("modalName").innerText = g.guestName || "";
  document.getElementById("modalTAddress").innerText = g.taddress || g.tempAddress || "-";
  document.getElementById("modalPAddress").innerText = g.paddress || "-";
  document.getElementById("modalMobile").innerText = g.guestMobile || "";

 

  const modalPhoto = document.getElementById("modalPhoto");
  modalPhoto.src = "../images/default-avatar.png";

  //  Cloudinary auto-load (same as other pages)
  loadGuestProfileImage(modalPhoto, g.guestMobile);


    /* ================= ID IMAGES ================= */

    // reset
    document.getElementById("idFrontImage").src = "";
    document.getElementById("idBackImage").src = "";

    // auto load (Pending / Active Guest jaisa)
   
//  resolve requestId using guestMobile
const requestId = await fetchRequestIdByGuestMobile(g.guestMobile);

if (requestId) {
  loadGuestIdImage(requestId, "front", "idFrontImage");
  loadGuestIdImage(requestId, "back", "idBackImage");
} else {
  document.getElementById("idFrontImage").src = "../images/default-id.png";
  document.getElementById("idBackImage").src = "../images/default-id.png";
}
    /* ============================================= */



  fetch(`https://pgmanagerbackend.onrender.com/otp/room-assignments?guestMobile=${g.guestMobile}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(rooms => {
      const room = rooms[0] || {};
      document.getElementById("roomNumber").innerText = room.roomNumber || "-";
      document.getElementById("floorNumber").innerText = room.floorNumber || "-";
      document.getElementById("buildingNumber").innerText = room.buildingNumber || "-";
      document.getElementById("roomAddress").innerText = room.address || "-";
    })
    .catch(() => {
      document.getElementById("roomNumber").innerText = "-";
      document.getElementById("floorNumber").innerText = "-";
      document.getElementById("buildingNumber").innerText = "-";
      document.getElementById("roomAddress").innerText = "-";
    });

}



//  Close Modal
document.getElementById("closeBtn").addEventListener("click", closeInfoModal);
function closeInfoModal() {
  const modal = document.getElementById("infoModal");
  modal.classList.remove("show");
  setTimeout(() => modal.style.display = "none", 300);
}

// =============================
//  Image Zoom
// =============================
function enableFullImageZoom(selector) {
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomImg = document.getElementById("zoomedImage");
  const closeZoom = document.getElementById("zoomCloseBtn");

  document.querySelectorAll(selector).forEach(img => {
    img.addEventListener("click", () => {
      zoomImg.src = img.src;
      zoomModal.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  closeZoom.addEventListener("click", () => {
    zoomModal.classList.remove("show");
    document.body.style.overflow = "";
  });

  zoomModal.addEventListener("click", (e) => {
    if (e.target === zoomModal) {
      zoomModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  });
}

//  Enable zoom on ID Front & Back when modal is open
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const modal = document.getElementById("infoModal");
    if (modal.classList.contains("show")) {
      enableFullImageZoom("#idFrontImage");
      enableFullImageZoom("#idBackImage");
    }
  });

  observer.observe(document.getElementById("infoModal"), {
    attributes: true,
    attributeFilter: ["class"]
  });
});


// =============================
//  BACK BUTTON WORKING
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();   
    });
  }
});






document.addEventListener("DOMContentLoaded", () => {

  const qrInput = document.getElementById("qrUpload");
  const qrPreview = document.getElementById("qrPreview");
  const qrError = document.getElementById("qrErrorMsg");

  
  if (!qrInput) return;

  qrInput.addEventListener("change", () => {

    const file = qrInput.files[0];

    // reset
    qrError.textContent = "";
    qrPreview.style.display = "none";

    if (!file) return;

    //  Size check (1 MB)
    if (file.size > 1024 * 1024) {
      qrError.textContent = "QR image size must be less than 1 MB.";
      qrInput.value = "";     // file remove
      return;
    }

    //  Preview show
    const reader = new FileReader();
    reader.onload = () => {
      qrPreview.src = reader.result;
      qrPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
});


async function loadGuestIdImage(requestId, side, imgElementId) {
  const token = localStorage.getItem("jwtToken");
  const img = document.getElementById(imgElementId);

  img.src = "";
  img.alt = "Loading...";
  img.classList.add("zoomable");
  img.style.cursor = "zoom-in";

  try {
    const res = await fetch(
      `https://pgmanagerbackend.onrender.com/otp/stay-request/id-image?requestId=${requestId}&side=${side}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Not allowed");

    const data = await res.json();
    img.src = data.url;

  } catch (err) {
    img.src = "../images/default-id.png";
    img.alt = "Image not available";
  }
}


async function loadGuestProfileImage(imgElement, guestMobile) {
  try {
    const res = await fetch(
      `https://pgmanagerbackend.onrender.com/otp/profileImageG?guestMobile=${guestMobile}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwtToken")
        }
      }
    );

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    imgElement.src = data.imageUrl;

  } catch {
    imgElement.src = "../images/default-avatar.png";
  }
}




async function fetchRequestIdByGuestMobile(guestMobile) {
  const token = localStorage.getItem("jwtToken");

  const res = await fetch("https://pgmanagerbackend.onrender.com/otp/all-guest", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return null;

  const data = await res.json();
  const guest = (data.requests || []).find(
    g => g.guestMobile === guestMobile
  );

  return guest ? guest.requestId : null;
}
