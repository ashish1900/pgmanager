let guestList = [];
let currentIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
    window.location.href = "login.html";
    return;
  }

  fetchAcceptedGuests(token);

  // Close button handler 
  document.getElementById("closeBtn").addEventListener("click", closeModal);

  // Outside click closes modal
  document.getElementById("infoModal").addEventListener("click", (e) => {
    if (e.target.id === "infoModal") closeModal();
  });

  // Escape key closes modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") nextGuest();
    if (e.key === "ArrowLeft") prevGuest();
  });

  // Zoom overlay close
  document.getElementById("zoomOverlay").addEventListener("click", () => {
    document.getElementById("zoomOverlay").style.display = "none";
  });

  // Prev/Next button events
  document.getElementById("prevBtn").addEventListener("click", prevGuest);
  document.getElementById("nextBtn").addEventListener("click", nextGuest);
});







function fetchAcceptedGuests(token) {
  fetch("http://localhost:8080/otp/pending-leave-request", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("guestsTableBody");
      tbody.innerHTML = "";

      if (data.status === "success" && data.requests?.length > 0) {
        guestList = data.requests;

        guestList.sort((a, b) => {
  const d1 = a.lrequestDate ? new Date(a.lrequestDate) : new Date(0);
  const d2 = b.lrequestDate ? new Date(b.lrequestDate) : new Date(0);
  return d2 - d1; // latest first
});


        data.requests.forEach((g, index) => {
          const { date, time } = formatDateTime(g.requestDate);
          const { date: lDate, time: lTime } = formatDateTime(g.lrequestDate);

          const row = document.createElement("tr");

          //  Guest Photo
          const imgCell = document.createElement("td");
          const profileImg = document.createElement("img");
          profileImg.className = "guest-profile";
          
          profileImg.src = "../images/default-avatar.png";

          //  Cloudinary image loader
          loadGuestProfileImage(profileImg, g.guestMobile);

          imgCell.appendChild(profileImg);

          //  Guest Name + See Button
          const nameCell = document.createElement("td");
          nameCell.classList.add("name-cell");
          nameCell.innerHTML = `
            <span>${g.guestName}</span>
            <button class="see-btn" onclick="openInfoModal(${index})">
              <i class="fa-solid fa-eye"></i> See
            </button>
          `;

          //  Accepting Date
          const dateCell = document.createElement("td");
          dateCell.innerHTML = `<span>${date}</span><br><span>${time}</span>`;

          //  Leave Request Date
          const leaveDateCell = document.createElement("td");
          leaveDateCell.innerHTML = `<span>${lDate}</span><br><span>${lTime}</span>`;

          //  Action Button
          const actionCell = document.createElement("td");
          const acceptBtn = document.createElement("button");
          acceptBtn.className = "accept-btn";
          acceptBtn.innerHTML = `<i class="fa-solid fa-check"></i> Accept`;
          acceptBtn.onclick = () => acceptLeaveRequest(g.guestMobile); // use ids from DTO
          actionCell.appendChild(acceptBtn);

          // Serial Number
const serialCell = document.createElement("td");
serialCell.textContent = index + 1;

row.append(
  serialCell,
  imgCell,
  nameCell,
  leaveDateCell,
  dateCell,
  actionCell
);

          tbody.appendChild(row);
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="6">No guests found</td></tr>`;
      }
    })
    .catch(() => {
      document.getElementById("guestsTableBody").innerHTML =
        `<tr><td colspan="5">Error loading guests</td></tr>`;
    });
}









function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return { date: "-", time: "-" };
  const d = new Date(dateTimeStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  };
}

function goBack() { window.history.back(); }

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
   modalPhoto.src = "../images/default-avatar.png";

    //  Cloudinary auto-load
    loadGuestProfileImage(modalPhoto, g.guestMobile);

    
    // 1 Reset images
  document.getElementById("idFrontImage").src = "";
  document.getElementById("idBackImage").src = "";

  // 2 AUTO load ID images (Pending Request style)
  loadGuestIdImage(g.requestId, "front", "idFrontImage");
  loadGuestIdImage(g.requestId, "back", "idBackImage");


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

  setupZoomableImages();
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





function acceptLeaveRequest(guestMobile) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  if (!confirm("Are you sure you want to accept this leave request?")) return;

  fetch(`http://localhost:8080/otp/leave-request/${guestMobile}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then(async res => {
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Leave request accepted successfully!");
        fetchAcceptedGuests(token); // refresh table
      } else {
        alert(data.message || "Failed to accept leave request.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error while processing request.");
    });
}



async function loadGuestIdImage(requestId, side, imgElementId) {
  const token = localStorage.getItem("jwtToken");
  const img = document.getElementById(imgElementId);

  img.src = "";
  img.alt = "Loading...";
  img.classList.add("zoomable");
  img.style.cursor = "zoom-in";

  try {
    const res = await fetch(
      `http://localhost:8080/otp/stay-request/id-image?requestId=${requestId}&side=${side}`,
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
      `http://localhost:8080/otp/profileImageG?guestMobile=${guestMobile}`,
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
