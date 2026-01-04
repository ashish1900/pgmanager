/*************************
 * DATE FORMATTER
 *************************/
function formatDateTimeIndian(dateStr) {
  if (!dateStr) return "-";

  const d = new Date(dateStr);
  if (isNaN(d)) return "-";

  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `
    <div>
      <div>${date}</div>
      <div style="font-size:12px;color:#777;">${time}</div>
    </div>
  `;
}

/*************************
 * SAFE MONTH ADDER
 *************************/
function addMonthsSafe(origDate, months) {
  const d = new Date(origDate.getTime());
  const day = d.getDate();

  d.setDate(1);
  d.setMonth(d.getMonth() + months);

  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));

  return d;
}

/*************************
 * GLOBAL STATE
 *************************/
let selectedPaymentType = "ROOM_RENT";
window.__JOIN_DATE__ = null;
window.__REMOVED_DATE__ = null;
window.__GUEST_STATUS__ = null;

/*************************
 * DOM READY
 *************************/
window.addEventListener("DOMContentLoaded", async () => {
  const guestMobile = localStorage.getItem("paymentGuestMobile");
  if (!guestMobile) {
    alert("No guest mobile found.");
    location.href = "totalGuest.html";
    return;
  }

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("You are not logged in!");
    location.href = "login.html";
    return;
  }

  document.getElementById("guestMobile").textContent = guestMobile;

  try {
    const photoEl = document.getElementById("guestPhoto");
photoEl.src = "../images/default-avatar.png"; // fallback first

// ✅ Cloudinary image loader (same as other pages)
loadGuestProfileImage(photoEl, guestMobile);

    await loadGuestDetails(guestMobile, token);
    setupPaymentTypeFilters(guestMobile, token);
    await loadPaymentsWithCycles(guestMobile, token);

  } catch (err) {
    console.error("❌ Error:", err);
    alert("Error loading payment history.");
  }

  setupZoomOverlayBase();
});

/*************************
 * LOAD GUEST DETAILS
 *************************/
async function loadGuestDetails(mobile, token) {
  const res = await fetch("https://pgmanagerbackend.onrender.com/otp/all-guest", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const guest = (data.requests || []).find(g => g.guestMobile === mobile);
  if (!guest) return;

  document.getElementById("guestName").textContent = guest.guestName || "-";


const statusEl = document.getElementById("guestStatus");
const rawStatus = (guest.status || "").toUpperCase();

statusEl.className = "status-badge"; // reset

if (rawStatus === "ACCEPTED") {
  statusEl.textContent = "Active";
  statusEl.classList.add("status-active");
} 
else if (rawStatus === "REMOVED") {
  statusEl.textContent = "Checked-Out";
  statusEl.classList.add("status-removed");
} 
else {
  statusEl.textContent = rawStatus || "-";
}



  document.getElementById("guestJoinDate").innerHTML =
    formatDateTimeIndian(guest.requestDate);

  window.__JOIN_DATE__ = guest.requestDate || null;
  window.__REMOVED_DATE__ = guest.lacceptedDate || null;
  window.__GUEST_STATUS__ = (guest.status || "").toUpperCase();

  const detailsBox = document.querySelector(".guest-details");
  document.getElementById("removedRow")?.remove();

  if (window.__GUEST_STATUS__ === "REMOVED" && window.__REMOVED_DATE__) {
    const p = document.createElement("p");
    p.id = "removedRow";
    p.innerHTML = `<b>Checked-out Date:</b> ${formatDateTimeIndian(window.__REMOVED_DATE__)}`;
    detailsBox.appendChild(p);
  }
}

/*************************
 * FILTER SETUP
 *************************/
function setupPaymentTypeFilters(guestMobile, token) {
  document.querySelectorAll(".type-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPaymentType = btn.dataset.type || "ALL";
      await loadPaymentsWithCycles(guestMobile, token);
    });
  });
}




/*************************
 * SAFE CYCLE GENERATOR
 *************************/


function generateCyclesSafe(joinDateStr) {
  if (!joinDateStr) return [];

  const joinDate = new Date(joinDateStr);
  const today = new Date();
  if (isNaN(joinDate) || joinDate > today) return [];

  let endLimit = today;
  if (window.__GUEST_STATUS__ === "REMOVED" && window.__REMOVED_DATE__) {
    const removed = new Date(window.__REMOVED_DATE__);
    if (!isNaN(removed)) endLimit = removed;
  }

  const cycles = [];
  let start = new Date(joinDate);

  while (start <= endLimit) {
    const end = addMonthsSafe(start, 1);

    // 🔥 DISPLAY END = end - 1 day
    const displayEnd = new Date(end);
    displayEnd.setDate(displayEnd.getDate() - 1);

    cycles.push({
      start: new Date(start),
      end: new Date(end), // exclusive (logic correct)
      label:
        `${start.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} → ` +
        `${displayEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
    });

    start = end;
  }

  return cycles.reverse();
}





/*************************
 * LOAD PAYMENTS + CYCLES
 *************************/
async function loadPaymentsWithCycles(guestMobile, token) {
  const tbody = document.getElementById("paymentTableBody");
  tbody.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;

  if (!window.__JOIN_DATE__) {
    tbody.innerHTML = `<tr><td colspan="9">Joining date not found.</td></tr>`;
    return;
  }

  const res = await fetch("https://pgmanagerbackend.onrender.com/otp/payment-historyO", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  let allPayments = (data.history || []).filter(p => p.guestMobile === guestMobile);

  if (selectedPaymentType !== "ALL") {
    allPayments = allPayments.filter(p =>
      (p.type || "").toUpperCase() === selectedPaymentType
    );
  }

  const cycles = generateCyclesSafe(window.__JOIN_DATE__);
  let serial = 1;
  const rows = [];

  cycles.forEach(cycle => {
    const cyclePayments = allPayments.filter(p => {
      if (!p.paymentDate) return false;
      const d = new Date(p.paymentDate);
      return d >= cycle.start && d < cycle.end;
    });

    if (cyclePayments.length === 0) {
      rows.push(`
        <tr>
          <td>${serial++}</td>
          <td>${cycle.label}</td>
          <td>-</td>
          <td>₹0</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td class="status-pending">Pending</td>
          <td>-</td>
        </tr>
      `);
      return;
    }

   const grouped = {};
const nonVerified = [];

cyclePayments.forEach(p => {
  const status = (p.status || "").toUpperCase();
  const type = (p.type || "UNKNOWN").toUpperCase();

  if (status === "VERIFIED") {
    (grouped[type] ||= []).push(p);   // ✅ only VERIFIED grouped
  } else {
    nonVerified.push(p);              // ❌ keep separate
  }
});

// 🔴 STEP 3: NON-VERIFIED payments (PENDING / REJECTED)
nonVerified.forEach(p => {
  rows.push(`
    <tr>
      <td>${serial++}</td>
      <td>${cycle.label}</td>
      <td>${getReadableTypeName(p.type)}</td>
      <td>₹${p.amount || 0}</td>
      <td>₹${p.amount || 0}</td>
      <td>${formatDateTimeIndian(p.paymentDate)}</td>
      <td>${formatDateTimeIndian(p.verifiedDate)}</td>
      <td class="status-pending">${p.status || "Pending"}</td>
      <td>
  ${p.receiptUrl
    ? `<img src="${resolveReceiptUrl(p.receiptUrl)}"
           class="receipt-img"
           width="55" height="55"
           style="border-radius:6px;cursor:zoom-in;">`
    : "-"}
</td>

    </tr>
  `);
});



    Object.keys(grouped).forEach(typeKey => {
      const arr = grouped[typeKey];
      const total = arr.reduce((s, p) => s + (p.amount || 0), 0);
      const typeName = getReadableTypeName(typeKey);

      arr.forEach((p, idx) => {
        let row = `<tr>`;
        if (idx === 0) row += `<td rowspan="${arr.length}">${serial++}</td>`;
        if (idx === 0) row += `<td rowspan="${arr.length}">${cycle.label}</td>`;
        if (idx === 0) row += `<td rowspan="${arr.length}">${typeName}</td>`;
        if (idx === 0) row += `<td rowspan="${arr.length}">₹${total}</td>`;

        row += `
          <td>₹${p.amount || 0}</td>
          <td>${formatDateTimeIndian(p.paymentDate)}</td>
          <td>${formatDateTimeIndian(p.verifiedDate)}</td>
          <td class="${(p.status || "").toUpperCase() === "VERIFIED" ? "status-paid" : "status-pending"}">
            ${p.status || "Pending"}
          </td>
          <td>
  ${p.receiptUrl
    ? `<img src="${resolveReceiptUrl(p.receiptUrl)}"
           class="receipt-img"
           width="55" height="55"
           style="border-radius:6px;cursor:zoom-in;">`
    : "-"}
</td>

        </tr>`;

        rows.push(row);
      });
    });
  });

  tbody.innerHTML = rows.join("");
  enableFullImageZoom(".receipt-img");
}

/*************************
 * HELPERS
 *************************/
function getReadableTypeName(type) {
  return ({
    ROOM_RENT: "Room Rent",
    ADVANCE_MONEY: "Advance Money",
    ELECTRICITY_BILL: "Electricity Bill",
    WATER_BILL: "Water Bill",
    SECURITY_MONEY: "Security Money"
  })[type] || type || "Unknown";
}

function setupZoomOverlayBase() {
  const zoomModal = document.getElementById("imageZoomModal");
  const closeZoom = document.getElementById("zoomCloseBtn");

  closeZoom.addEventListener("click", () => zoomModal.classList.remove("show"));
  zoomModal.addEventListener("click", e => {
    if (e.target === zoomModal) zoomModal.classList.remove("show");
  });
}

function enableFullImageZoom(selector) {
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomImg = document.getElementById("zoomedImage");

  document.querySelectorAll(selector).forEach(img => {
    img.addEventListener("click", () => {
      zoomImg.src = img.src;
      zoomModal.classList.add("show");
    });
  });
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

    if (!data.imageUrl || !data.imageUrl.startsWith("http")) {
      throw new Error("Invalid image URL");
    }

    imgElement.src = data.imageUrl;

  } catch (err) {
    imgElement.src = "../images/default-avatar.png";
  }
}




const BASE_URL = "https://pgmanagerbackend.onrender.com/otp";

function resolveReceiptUrl(url) {
  if (!url) return "";

  // ✅ Cloudinary / public URL
  if (url.startsWith("http")) {
    return url;
  }

  // ✅ backend relative path
  return BASE_URL + url;
}




function goBack() {
  history.back();
}
