     
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

  // Start from joinDate and move forward until next cycle would be after today
  let start = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate());
  while (addMonthsSafe(start, 1) <= today) {
    start = addMonthsSafe(start, 1);
  }
  const end = addMonthsSafe(start, 1);
  return { cycleStart: start, cycleEnd: end };
}

function percentBetween(start, end, at = new Date()) {
  const s = start.getTime(), e = end.getTime(), a = new Date(at).getTime();
  if (a <= s) return 0;
  if (a >= e) return 100;
  return ((a - s) / (e - s)) * 100;
}






function createDonut(percent, color, mainLabel = "", subLabel = "", direction = "normal") {
  const size = 80;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const filled = Math.max(0, Math.min(100, percent));
  const dash = (filled / 100) * circumference;

  // always start at TOP (12 o'clock)
  const dashOffset = direction === "reverse"
      ? dash                    // anti-clockwise
      : circumference - dash;   // clockwise

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

        <!-- background circle -->
        <circle cx="${size/2}" cy="${size/2}" r="${radius}"
                stroke="#eee" stroke-width="${stroke}" fill="none" />

        <!-- progress arc -->
        <circle cx="${size/2}" cy="${size/2}" r="${radius}"
                stroke="url(#${gid})" stroke-width="${stroke}"
                stroke-linecap="round"
                stroke-dasharray="${dash} ${circumference - dash}"
                stroke-dashoffset="${dashOffset}"
                fill="none"
                transform="rotate(-90 ${size/2} ${size/2})"
        />
      </svg>

      <div class="donut-center">
        <div style="font-size:14px;font-weight:700">${mainLabel}</div>
        <div style="font-size:10px;color:#666">${subLabel}</div>
      </div>
    </div>
  `;
}





/* -------------------------
   Main - fetch payments & guests, render table
   ------------------------- */
let guestList = [];
let currentIndex = 0;




window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
    window.location.href = "login.html";
    return;
  }






  fetchPaymentHistory(token)
    .then(paymentsMap => fetchAcceptedGuests(token, paymentsMap))
    .catch(err => {
      console.error("Error fetching payments", err);
      fetchAcceptedGuests(token, new Map());
    });

  // modal handlers
  document.getElementById("closeBtn").addEventListener("click", closeModal);
  document.getElementById("infoModal").addEventListener("click", (e) => {
    if (e.target.id === "infoModal") closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") nextGuest();
    if (e.key === "ArrowLeft") prevGuest();
  });

  document.getElementById("zoomOverlay").addEventListener("click", () => {
    document.getElementById("zoomOverlay").style.display = "none";
  });

  document.getElementById("prevBtn").addEventListener("click", prevGuest);
  document.getElementById("nextBtn").addEventListener("click", nextGuest);

  // FILTER BUTTON EVENTS
document.getElementById("btnAll").addEventListener("click", () => { 
  filterType = "ALL"; 
  setActiveButton("btnAll");
  applyFilter();
  renderTable();
});

document.getElementById("btnActive").addEventListener("click", () => {
  filterType = "ACTIVE";
  setActiveButton("btnActive");
  applyFilter();
  renderTable();
});

document.getElementById("btnRemoved").addEventListener("click", () => {
  filterType = "REMOVED";
  setActiveButton("btnRemoved");
  applyFilter();
  renderTable();
});


});

/* Fetch full payment history and return Map(guestMobile => [payments]) */
async function fetchPaymentHistory(token) {
  try {
    const res = await fetch("http://localhost:8080/otp/payment-historyO", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("payment history fetch failed");
    const data = await res.json();
    const all = data.history || [];
    const map = new Map();
    all.forEach(p => {
      const m = p.guestMobile || "";
      if (!map.has(m)) map.set(m, []);
      map.get(m).push(p);
    });
    return map;
  } catch (err) {
    console.error("Error loading payments:", err);
    return new Map();
  }
}

function fetchAcceptedGuests(token, paymentsMap = new Map()) {
  fetch("http://localhost:8080/otp/all-guest", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("guestsTableBody");
      tbody.innerHTML = "";

      if (data.status === "success" && data.requests?.length > 0) {

        guestList = data.requests.sort((a, b) => {
    const dateA = new Date(a.requestDate);
    const dateB = new Date(b.requestDate);
    return dateB - dateA; // DESCENDING (oldest first)
});


        data.requests.forEach((g, index) => {
          const statusText = (g.status || "").toLowerCase();
          const showIndicator = (g.status === "ACCEPTED" || g.status === "accepted");

          const { date: acceptDate, time: acceptTime } = formatDateTime(g.requestDate);
          const { date: leaveReqDate, time: leaveReqTime } = formatDateTime(g.lrequestDate);
          const { date: leaveAccDate, time: leaveAccTime } = formatDateTime(g.lacceptedDate);

          const row = document.createElement("tr");

          // Photo cell
          const imgCell = document.createElement("td");
          const profileImg = document.createElement("img");
          profileImg.className = "guest-profile";
          fetch(`http://localhost:8080/otp/profileImageG?guestMobile=${g.guestMobile}`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
            .then(res => res.ok ? res.blob() : Promise.reject())
            .then(blob => profileImg.src = URL.createObjectURL(blob))
            .catch(() => profileImg.src = "default-avatar.png");
          imgCell.appendChild(profileImg);

          // Name cell
          const nameCell = document.createElement("td");
          nameCell.className = "name-cell";
          nameCell.innerHTML = `
            <span>${g.guestName || "-"}</span>
            <button class="see-btn" onclick="openInfoModal(${index})">
              <i class="fa-solid fa-eye"></i> See
            </button>
          `;

          // Status cell
          const statusCell = document.createElement("td");
          statusCell.className = "status-cell";
          statusCell.textContent = g.status || "-";

          // Joining/accept date
          const acceptDateCell = document.createElement("td");
          acceptDateCell.innerHTML = `<span>${acceptDate}</span><br><span class="text-muted">${acceptTime}</span>`;

          // Cycle indicator column
          const cycleCell = document.createElement("td");
          cycleCell.className = "cycle-col";

          if (!showIndicator) {
            cycleCell.innerHTML = `<div class="text-muted">—</div>`;
          } else {
            const cycle = getCurrentCycle(g.requestDate, new Date());
            if (!cycle) {
              cycleCell.innerHTML = `<div class="text-muted">No cycle</div>`;
            } else {
              const paymentsForGuest = paymentsMap.get(g.guestMobile) || [];
              // filter room rent verified payments
              const roomRentPayments = paymentsForGuest.filter(p => (
                (p.type === "ROOM_RENT" || p.type === "Room Rent" || p.type === "RENT")
                && (p.status === "Verified" || p.status === "verified" || p.status === "VERIFIED")
              ));

              // payments inside current cycle window
              const verifiedInCycle = roomRentPayments.filter(p => {
                if (!p.paymentDate) return false;
                const pd = new Date(p.paymentDate);
                return pd >= cycle.cycleStart && pd < cycle.cycleEnd;
              });

              // cycle progress by time elapsed (0-100)
              const cycleProgress = percentBetween(cycle.cycleStart, cycle.cycleEnd, new Date());

              let donutHtml;
              if (verifiedInCycle.length > 0) {
                // If guest paid in this cycle -> show green clockwise representing remaining portion
                // remainingPct = 100 - elapsedPct (so recently paid -> more green)
                const greenPct = Math.max(0, 100 - cycleProgress);
                
                let daysLeft = Math.floor((cycle.cycleEnd - new Date()) / (1000*60*60*24));
                donutHtml = createDonut(greenPct, "#28a745", `${daysLeft}d`, "Left", "normal");

              } else {
                // Unpaid -> show red representing elapsed (Anti-clockwise)
                const redPct = Math.min(100, Math.max(0, cycleProgress));

                let daysLate = Math.floor((new Date() - cycle.cycleStart) / (1000*60*60*24));
                donutHtml = createDonut(redPct, "#e44c4c", `${daysLate}d`, "Late", "reverse");

              }

              const startStr = cycle.cycleStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
              const endStr = new Date(cycle.cycleEnd.getTime() - 1).toLocaleDateString("en-GB",{ day: "2-digit", month: "short", year: "numeric"});
              cycleCell.innerHTML = `${donutHtml}<div class="text-muted" style="margin-top:6px;font-size:12px">${startStr} → ${endStr}</div>`;
            }
          }

          const leaveReqCell = document.createElement("td");
          leaveReqCell.innerHTML = g.lrequestDate
            ? `<span>${leaveReqDate}</span><br><span class="text-muted">${leaveReqTime}</span>` : "-";

          const leaveAccCell = document.createElement("td");
          leaveAccCell.innerHTML = g.lacceptedDate
            ? `<span>${leaveAccDate}</span><br><span class="text-muted">${leaveAccTime}</span>` : "-";

          // Payment cell - Pay button
          const payCell = document.createElement("td");
          const payBtn = document.createElement("button");
          payBtn.className = "see-pay";
          payBtn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay`;
          payBtn.onclick = () => openPaymentPage(g.guestMobile);
          payCell.appendChild(payBtn);

          row.append(imgCell, nameCell, statusCell, acceptDateCell, cycleCell, leaveReqCell, leaveAccCell, payCell);
          tbody.appendChild(row);
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="8">No guests found</td></tr>`;
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("guestsTableBody").innerHTML =
        `<tr><td colspan="8">Error loading guests</td></tr>`;
    });
}

/* Helper: open payment page */
function openPaymentPage(guestMobile) {
  if (!guestMobile) {
    alert("Guest mobile number not found!");
    return;
  }
  localStorage.setItem("paymentGuestMobile", guestMobile);
  window.location.href = "payment.html";
}

/* Date formatting */
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return { date: "-", time: "-" };
  const d = new Date(dateTimeStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) // AM/PM FIX
  };
}

function goBack() { window.history.back(); }

/* modal & detail functions (keeping them from your code) */
function openInfoModal(index) {
  currentIndex = index;
  const g = guestList[index];
  const token = localStorage.getItem("jwtToken");
  const modal = document.getElementById("infoModal");

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);

  document.getElementById("modalName").innerText = g.guestName || "";
  document.getElementById("modalTAddress").innerText = g.taddress || "";
  document.getElementById("modalPAddress").innerText = g.paddress || "";
  document.getElementById("modalMobile").innerText = g.guestMobile || "";

  const modalPhoto = document.getElementById("modalPhoto");
  fetch(`http://localhost:8080/otp/profileImageG?guestMobile=${g.guestMobile}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.ok ? res.blob() : Promise.reject())
    .then(blob => modalPhoto.src = URL.createObjectURL(blob))
    .catch(() => modalPhoto.src = "default-avatar.png");

  fetch(`http://localhost:8080/otp/room-assignments?guestMobile=${g.guestMobile}`, {
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

  loadIDImage(g.idFront, "idFrontImage", token);
  loadIDImage(g.idBack, "idBackImage", token);
  setupZoomableImages();
}

function loadIDImage(fileName, elementId, token) {
  const img = document.getElementById(elementId);
  if (fileName) {
    fetch(`http://localhost:8080/otp/request-id-image?fileName=${fileName}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.ok ? res.blob() : Promise.reject())
      .then(blob => img.src = URL.createObjectURL(blob))
      .catch(() => img.src = "default-id.png");
  } else img.src = "default-id.png";
}



function closeModal() {
  const modal = document.getElementById("infoModal");
  modal.classList.remove("show");
  setTimeout(() => modal.style.display = "none", 300);
}

function nextGuest() {
  if (currentIndex < guestList.length - 1) openInfoModal(currentIndex + 1);
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
