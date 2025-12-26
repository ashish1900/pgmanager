/* totalGuest.js - FULL FINAL VERSION (WITH ALL FIXES)  */

// 🔥 CLEAR ACTIVE GUEST STATE ON REFRESH
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  sessionStorage.removeItem("AG_SCROLL");
  sessionStorage.removeItem("AG_FILTER");
  sessionStorage.removeItem("AG_CYCLE_FILTER");
}




/* -------------------------
   GLOBAL + FILTER
------------------------- */
let guestList = [];
let filteredList = [];
let filterType = "ACTIVE"; 
let cycleFilter = "ALL_CYCLE"; 
let currentIndex = 0;
let globalPaymentsMap = new Map();

/* -------------------------
   UTILITIES
------------------------- */
function addMonthsSafe(origDate, months) {
  const d = new Date(origDate.getTime());
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDay));
  return d;
}

function getCurrentCycle(joinDateInput, todayInput = new Date()) {
  const joinDate = new Date(joinDateInput);
  const today = new Date(todayInput);
  if (isNaN(joinDate)) return null;
  if (joinDate > today) return null;

  let start = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate());
  while (addMonthsSafe(start, 1) <= today) {
    start = addMonthsSafe(start, 1);
  }
  const end = addMonthsSafe(start, 1);
  return { cycleStart: start, cycleEnd: end };
}

function percentBetween(start, end, at = new Date()) {
  const s = start.getTime(), e = end.getTime(), a = at.getTime();
  if (a <= s) return 0;
  if (a >= e) return 100;
  return ((a - s) / (e - s)) * 100;
}

function guestFilterSelect() {
  const val = document.getElementById("guestFilterMobile").value;

  // trigger actual logic
  document.getElementById(val).click();

  // UI logic — Show/hide cycle
  const cycleDropdown = document.getElementById("cycleFilterMobile");

  if(val === "btnActive"){
      cycleDropdown.style.display = "block";
  } else {
      cycleDropdown.style.display = "none";

      // reset cycle to All when hidden
      cycleFilter = "ALL_CYCLE";
      document.getElementById("cycleFilterMobile").value = "cycleAll";
      document.getElementById("cycleAll").click();
  }
}



function cycleFilterSelect() {
  const val = document.getElementById("cycleFilterMobile").value;
  document.getElementById(val).click();
}




/* -------------------------
   DONUT MAKER
------------------------- */
function createDonut(percent, color, mainLabel = "", subLabel = "", direction = "normal") {
  const size = 80;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const filled = Math.max(0, Math.min(100, percent));
  const dash = (filled / 100) * circumference;

  const dashOffset = direction === "reverse" ? dash : (circumference - dash);
  const gid = "g_" + Math.random().toString(36).slice(2, 8);

  return `
    <div class="donut">
      <svg viewBox="0 0 ${size} ${size}">
        <defs>
          <linearGradient id="${gid}">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${color}" />
          </linearGradient>
        </defs>

        <circle cx="${size/2}" cy="${size/2}" r="${radius}"
                stroke="#eee" stroke-width="${stroke}" fill="none" />

        <circle cx="${size/2}" cy="${size/2}" r="${radius}"
                stroke="url(#${gid})" stroke-width="${stroke}"
                stroke-linecap="round"
                stroke-dasharray="${dash} ${circumference-dash}"
                stroke-dashoffset="${dashOffset}"
                fill="none"
                transform="rotate(-90 ${size/2} ${size/2})" />
      </svg>

      <div class="donut-center">
        <div style="font-size:14px;font-weight:700">${mainLabel}</div>
        <div style="font-size:10px;color:#666">${subLabel}</div>
      </div>
    </div>
  `;
}

/* -------------------------
   FILTER HANDLER
------------------------- */
function applyFilter() {

  /* Guest Status Filter */
  if (filterType === "ACTIVE") {
    filteredList = guestList.filter(g => g.status === "ACCEPTED");
  } 
  else if (filterType === "REMOVED") {
    filteredList = guestList.filter(g => g.status === "REMOVED");
  } 
  else {
    filteredList = [...guestList];
  }



  /* -------- Cycle Filter -------- */
  

  if (cycleFilter === "PAID") {
  filteredList = filteredList.filter(g => {

    const st = (g.status || "").trim().toUpperCase();
    if (st !== "ACCEPTED") return false;   // FIXED

    const cycle = getCurrentCycle(g.requestDate);
    if (!cycle) return false;

    const payments = globalPaymentsMap.get(g.guestMobile) || [];

    const verified = payments.filter(p =>
      ["ROOM_RENT","ROOM RENT","RENT"].includes((p.type || "").trim().toUpperCase()) &&
      ["VERIFIED"].includes((p.status || "").trim().toUpperCase())
    );

    const inside = verified.filter(p => {
      const pd = new Date(p.paymentDate);
      return pd >= cycle.cycleStart && pd < cycle.cycleEnd;
    });

    return inside.length > 0;
  });
}


else if (cycleFilter === "DUE") {
  filteredList = filteredList.filter(g => {

    const st = (g.status || "").trim().toUpperCase();
    if (st !== "ACCEPTED") return false;   // FIXED

    const cycle = getCurrentCycle(g.requestDate);
    if (!cycle) return false;

    const payments = globalPaymentsMap.get(g.guestMobile) || [];

    const verified = payments.filter(p =>
      ["ROOM_RENT","ROOM RENT","RENT"].includes((p.type || "").trim().toUpperCase()) &&
      ["VERIFIED"].includes((p.status || "").trim().toUpperCase())
    );

    const inside = verified.filter(p => {
      const pd = new Date(p.paymentDate);
      return pd >= cycle.cycleStart && pd < cycle.cycleEnd;
    });

    return inside.length === 0;
  });
}
  
}


/* -------------------------
   SHOW / HIDE RIGHT FILTERS
------------------------- */
function updateRightFiltersVisibility() {
  const right = document.querySelector(".right-filters");

  if (!right) return;

  if (filterType === "ACTIVE") {
    right.classList.add("show-right"); 
  } else {
    right.classList.remove("show-right");
    cycleFilter = "ALL_CYCLE";
    setCycleActive("cycleAll");
  }
}



// ✅ ACTIVE par Leave Columns Hide / Show
function toggleLeaveColumnsSimple(show) {
  const display = show ? "" : "none";

  document.querySelectorAll(
    ".guest-table tr th:nth-child(7), .guest-table tr td:nth-child(7), " +
    ".guest-table tr th:nth-child(8), .guest-table tr td:nth-child(8)"
  ).forEach(el => {
    el.style.display = display;
  });
}


// ✅ CHECK-OUT par Cycle column hide / baaki sab show
function toggleCycleColumnByFilter() {
  const showCycle = filterType !== "REMOVED";   // REMOVED → hide

  document.querySelectorAll(
    ".guest-table tr th:nth-child(6), .guest-table tr td:nth-child(6)"
  ).forEach(el => {
    el.style.display = showCycle ? "" : "none";
  });
}




function setActiveButton(id) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setCycleActive(id) {
  document.querySelectorAll(".filter-btn2").forEach(b => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* -------------------------
   DOM READY
------------------------- */
window.addEventListener("DOMContentLoaded", () => {

  updateRightFiltersVisibility();   // ⭐ ADD THIS AT TOP


  // 🌟 Sync Mobile Filter UI on first load
if (window.innerWidth <= 768) {
  if (filterType === "ACTIVE") {
    document.getElementById("cycleFilterMobile").style.display = "block";
  } else {
    document.getElementById("cycleFilterMobile").style.display = "none";
  }
}



  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login first!");
    window.location.href = "login.html";
    return;
  }

  /* Guest Filters */
  document.getElementById("btnAll").addEventListener("click", () => {
    filterType = "ALL";
    setActiveButton("btnAll");


    cycleFilter = "ALL_CYCLE";          
    setCycleActive("cycleAll");        

    applyFilter();
    updateRightFiltersVisibility();
    renderTable(globalPaymentsMap);

    toggleLeaveColumnsSimple(true);   // ✅ show
    toggleCycleColumnByFilter();


  });

  document.getElementById("btnActive").addEventListener("click", () => {
    filterType = "ACTIVE";
    setActiveButton("btnActive");

    cycleFilter = "ALL_CYCLE";          // ⭐ NEW
    setCycleActive("cycleAll");         // ⭐ NEW


    applyFilter();
    updateRightFiltersVisibility(); 
    renderTable(globalPaymentsMap);
    toggleLeaveColumnsSimple(false);   // ✅ ACTIVE → HIDE
    toggleCycleColumnByFilter();


  });

  document.getElementById("btnRemoved").addEventListener("click", () => {
    filterType = "REMOVED";
    setActiveButton("btnRemoved");


    cycleFilter = "ALL_CYCLE";          // ⭐ NEW
    setCycleActive("cycleAll");         // ⭐ NEW


    applyFilter();
    updateRightFiltersVisibility();
    renderTable(globalPaymentsMap);

    toggleLeaveColumnsSimple(true);   // ✅ show
    toggleCycleColumnByFilter();



  });

  /* Cycle Filters */
  document.getElementById("cycleAll").addEventListener("click", () => {
    cycleFilter = "ALL_CYCLE";
    setCycleActive("cycleAll");
    applyFilter();
    renderTable(globalPaymentsMap);

    toggleLeaveColumnsSimple(filterType !== "ACTIVE");
    toggleCycleColumnByFilter();


  });

  document.getElementById("cyclePaid").addEventListener("click", () => {
    cycleFilter = "PAID";
    setCycleActive("cyclePaid");
    applyFilter();
    renderTable(globalPaymentsMap);

    toggleLeaveColumnsSimple(filterType !== "ACTIVE");
    toggleCycleColumnByFilter();


  });

  document.getElementById("cycleDue").addEventListener("click", () => {
    cycleFilter = "DUE";
    setCycleActive("cycleDue");
    applyFilter();
    renderTable(globalPaymentsMap);

    toggleLeaveColumnsSimple(filterType !== "ACTIVE");
    toggleCycleColumnByFilter();



  });

  /* FETCH */
  fetchPaymentHistory(token)
    .then(payMap => {
      globalPaymentsMap = payMap;
      fetchAcceptedGuests(token, payMap);
    })
    .catch(() => fetchAcceptedGuests(token, new Map()));



    
  // Modal Events
  document.getElementById("closeBtn").addEventListener("click", closeModal);
  document.getElementById("zoomOverlay").addEventListener("click", () => {
    document.getElementById("zoomOverlay").style.display = "none";
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") nextGuest();
    if (e.key === "ArrowLeft") prevGuest();
  });

  document.getElementById("prevBtn").addEventListener("click", prevGuest);
  document.getElementById("nextBtn").addEventListener("click", nextGuest);

   setTimeout(() => {
    toggleLeaveColumnsSimple(filterType !== "ACTIVE");
    toggleCycleColumnByFilter();
  }, 50);

});

/* -------------------------
   FETCH PAYMENT HISTORY
------------------------- */
async function fetchPaymentHistory(token) {
  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/payment-historyO", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const map = new Map();

    (data.history || []).forEach(p => {
      if (!map.has(p.guestMobile)) map.set(p.guestMobile, []);
      map.get(p.guestMobile).push(p);
    });

    return map;
  } catch {
    return new Map();
  }
}

/* -------------------------
   FETCH GUEST LIST
------------------------- */
function fetchAcceptedGuests(token, paymentsMap) {
  fetch("https://pgmanagerbackend.onrender.com/otp/all-guest", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {

      if (!(data.status === "success" && data.requests?.length > 0)) {
        document.getElementById("guestsTableBody").innerHTML =
          `<tr><td colspan="8">No guests found</td></tr>`;
        return;
      }

      guestList = data.requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      
      updateCounts();
      updateCycleCounts();

      applyFilter();
      renderTable(paymentsMap);
    });
}


function updateCounts() {
  const total = guestList.length;
  const active = guestList.filter(g => g.status === "ACCEPTED").length;
  const removed = guestList.filter(g => g.status === "REMOVED").length;

  document.getElementById("countAll").textContent = total;
  document.getElementById("countActive").textContent = active;
  document.getElementById("countRemoved").textContent = removed;

  // Update Mobile Dropdown Text
document.getElementById("optActive").textContent = `Active Guest (${active})`;
document.getElementById("optAll").textContent = `Total Guest (${total})`;
document.getElementById("optRemoved").textContent = `Check-out Guest (${removed})`;

}


function updateCycleCounts() {
  let activeGuests = guestList.filter(g => g.status === "ACCEPTED");

  let cycleAll = activeGuests.length;
  let cyclePaid = 0;
  let cycleDue = 0;

  activeGuests.forEach(g => {
    const cycle = getCurrentCycle(g.requestDate);
    if (!cycle) return;

    const payments = globalPaymentsMap.get(g.guestMobile) || [];

    const verified = payments.filter(p =>
      ["ROOM_RENT","ROOM RENT","RENT"].includes((p.type || "").trim().toUpperCase()) &&
      ["VERIFIED"].includes((p.status || "").trim().toUpperCase())
    );

    const inside = verified.filter(p => {
      const pd = new Date(p.paymentDate);
      return pd >= cycle.cycleStart && pd < cycle.cycleEnd;
    });

    if (inside.length > 0) cyclePaid++;
    else cycleDue++;
  });

  document.getElementById("countCycleAll").textContent = cycleAll;
  document.getElementById("countCyclePaid").textContent = cyclePaid;
  document.getElementById("countCycleDue").textContent = cycleDue;


  // Update Mobile Cycle Dropdown Text
document.getElementById("optCycleAll").textContent = `All (${cycleAll})`;
document.getElementById("optCyclePaid").textContent = `Paid (${cyclePaid})`;
document.getElementById("optCycleDue").textContent = `Due (${cycleDue})`;

}



/* -------------------------
   RENDER TABLE
------------------------- */
function renderTable(paymentsMap) {

  const tbody = document.getElementById("guestsTableBody");
  tbody.innerHTML = "";

  if (filteredList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">No guests found</td></tr>`;
    return;
  }

  filteredList.forEach((g, index) => {


    /* SERIAL NUMBER */
    const serialCell = document.createElement("td");
    serialCell.textContent = index + 1;


    const token = localStorage.getItem("jwtToken");

    const { date: acceptDate, time: acceptTime } = formatDateTime(g.requestDate);
    const { date: leaveReqDate, time: leaveReqTime } = formatDateTime(g.lrequestDate);
    const { date: leaveAccDate, time: leaveAccTime } = formatDateTime(g.lacceptedDate);

    const row = document.createElement("tr");

    /* PHOTO */
    const imgCell = document.createElement("td");
    const profileImg = document.createElement("img");
    profileImg.className = "guest-profile";
    fetch(`https://pgmanagerbackend.onrender.com/otp/profileImageG?guestMobile=${g.guestMobile}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(b => profileImg.src = URL.createObjectURL(b))
      .catch(() => profileImg.src = "default-avatar.png");

    imgCell.appendChild(profileImg);

    /* NAME */
    const nameCell = document.createElement("td");
    nameCell.className = "name-cell";
    nameCell.innerHTML = `
      <span>${g.guestName}</span>
      <button class="see-btn" onclick="openInfoModal(${index})">
      <i class="fa-solid fa-eye"></i> See
      </button>
    `;

    /* STATUS */
const statusCell = document.createElement("td");

const isActive = g.status === "ACCEPTED";

statusCell.innerHTML = `
  <div class="stay-status">
    <span class="stay-text ${isActive ? "active" : "checked"}">
      ${isActive ? "Active" : "Checked Out"}
    </span>
    <span class="status-dot ${isActive ? "dot-green" : "dot-red"}"></span>
  </div>
`;
   

    /* JOINING DATE */
    const acceptDateCell = document.createElement("td");
    acceptDateCell.innerHTML =
      `${acceptDate}<br><span class="text-muted">${acceptTime}</span>`;

    /* CYCLE */
    const cycleCell = document.createElement("td");

    if (g.status !== "ACCEPTED") {
      cycleCell.innerHTML = `<div class="text-muted">—</div>`;
    } else {

      const cycle = getCurrentCycle(g.requestDate);
      if (cycle) {

        const payments = paymentsMap.get(g.guestMobile) || [];
        const verified = payments.filter(p =>
          ["ROOM_RENT","Room Rent","RENT"].includes(p.type) &&
          ["Verified","verified","VERIFIED"].includes(p.status)
        );

        const inside = verified.filter(p => {
          const pd = new Date(p.paymentDate);
          return pd >= cycle.cycleStart && pd < cycle.cycleEnd;
        });

        const cycleProgress = percentBetween(cycle.cycleStart, cycle.cycleEnd);

        let donutHtml;
        if (inside.length > 0) {
          const greenPct = 100 - cycleProgress;
          const daysLeft = Math.floor((cycle.cycleEnd - new Date()) / 86400000);
          donutHtml = createDonut(greenPct, "#28a745", `${daysLeft}d`, "Left");
        } else {
          const redPct = cycleProgress;
          const daysLate = Math.floor((new Date() - cycle.cycleStart) / 86400000);
          donutHtml = createDonut(redPct, "#e44c4c", `${daysLate}d`, "Late", "reverse");
        }

        const startStr = cycle.cycleStart.toLocaleDateString("en-GB");
        const endStr = new Date(cycle.cycleEnd - 1).toLocaleDateString("en-GB");

        cycleCell.innerHTML = `
          ${donutHtml}
          <div class="text-muted" style="margin-top:6px;font-size:12px">${startStr} → ${endStr}</div>
        `;
      }
    }

    /* LEAVE REQUEST */
    const leaveReqCell = document.createElement("td");
    leaveReqCell.innerHTML = g.lrequestDate
      ? `${leaveReqDate}<br><span class="text-muted">${leaveReqTime}</span>`
      : "-";

    /* LEAVE ACCEPT */
    const leaveAccCell = document.createElement("td");
    leaveAccCell.innerHTML = g.lacceptedDate
      ? `${leaveAccDate}<br><span class="text-muted">${leaveAccTime}</span>`
      : "-";

    /* PAY BUTTON */
    const payCell = document.createElement("td");
    payCell.innerHTML =
      `<button class="see-pay" onclick="openPaymentPage('${g.guestMobile}')">Payment History</button>`;

    row.append(serialCell, imgCell, nameCell, statusCell, acceptDateCell, cycleCell, leaveReqCell, leaveAccCell, payCell);
    tbody.appendChild(row);
  });

    // ✅ ✅ ACTIVE state ke hisab se columns dubara sync karo
  toggleLeaveColumnsSimple(filterType !== "ACTIVE");

  toggleCycleColumnByFilter();   // ✅ NEW


}






// ===============================
// 🔁 RESTORE ACTIVE GUEST STATE
// ===============================
const savedFilter = sessionStorage.getItem("AG_FILTER");
const savedCycle = sessionStorage.getItem("AG_CYCLE_FILTER");
const savedScroll = sessionStorage.getItem("AG_SCROLL");

if (savedFilter) {
  filterType = savedFilter;
  setActiveButton("btnActive");   // Active Guest page ka default
}

if (savedCycle) {
  cycleFilter = savedCycle;

  if (cycleFilter === "PAID") setCycleActive("cyclePaid");
  else if (cycleFilter === "DUE") setCycleActive("cycleDue");
  else setCycleActive("cycleAll");
}

applyFilter();
updateRightFiltersVisibility();
renderTable(globalPaymentsMap);

// 🔥 restore scroll AFTER render
if (savedScroll) {
  setTimeout(() => {
    document.querySelector(".table-body-scroll").scrollTop = Number(savedScroll);
  }, 300);
}








/* -------------------------
   OTHER FUNCTIONS
------------------------- */
function openPaymentPage(guestMobile) {


  sessionStorage.setItem("AG_SCROLL", document.querySelector(".table-body-scroll").scrollTop);
  sessionStorage.setItem("AG_FILTER", filterType);        // ACTIVE
  sessionStorage.setItem("AG_CYCLE_FILTER", cycleFilter);

  localStorage.setItem("paymentGuestMobile", guestMobile);
  window.location.href = "payment.html";
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return { date: "-", time: "-" };
  const d = new Date(dateTimeStr);
  return {
    date: d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }),
    time: d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })
  };
}



/* -------------------------
   MODAL FIX
------------------------- */
function goBack() { window.history.back(); }

function openInfoModal(index) {

  currentIndex = index;

  // ⭐ FIX — filteredList से डेटा लो
  const g = filteredList[index];

  const token = localStorage.getItem("jwtToken");
  const modal = document.getElementById("infoModal");

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);

  document.getElementById("modalName").innerText = g.guestName || "";
  document.getElementById("modalTAddress").innerText = g.taddress || "";
  document.getElementById("modalPAddress").innerText = g.paddress || "";
  document.getElementById("modalMobile").innerText = g.guestMobile || "";

  const modalPhoto = document.getElementById("modalPhoto");
  fetch(`https://pgmanagerbackend.onrender.com/otp/profileImageG?guestMobile=${g.guestMobile}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.ok ? res.blob() : Promise.reject())
    .then(blob => modalPhoto.src = URL.createObjectURL(blob))
    .catch(() => modalPhoto.src = "default-avatar.png");

  fetch(`https://pgmanagerbackend.onrender.com/otp/room-assignments?guestMobile=${g.guestMobile}`, {
    headers: { Authorization: `Bearer ${token}` }
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

  loadIDImage(g.idFront, "idFrontImage", token);
  loadIDImage(g.idBack, "idBackImage", token);
  setupZoomableImages();
}

function loadIDImage(fileName, elementId, token) {
  const img = document.getElementById(elementId);
  if (fileName) {
    fetch(`https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${fileName}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.blob() : Promise.reject())
      .then(blob => img.src = URL.createObjectURL(blob))
      .catch(() => img.src = "default-id.png");
  } else img.src = "default-id.png";
}

function closeModal() {
  const modal = document.getElementById("infoModal");
  modal.classList.remove("show");
  setTimeout(() => modal.style.display = "none", 50);
}

function nextGuest() {
  if (currentIndex < filteredList.length - 1) openInfoModal(currentIndex + 1);
}
function prevGuest() {
  if (currentIndex > 0) openInfoModal(currentIndex - 1);
}

function setupZoomableImages() {
  document.querySelectorAll(".zoomable").forEach(img => {
    img.onclick = () => {
      const zoomOverlay = document.getElementById("zoomOverlay");
      const zoomImage = document.getElementById("zoomImage");
      zoomImage.src = img.src;
      zoomOverlay.style.display = "flex";
    };
  });
}
