window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("You are not login please first login");
    window.location.href = "login.html";
    return;
  }

  // Fetch Owner Dashboard Info
  fetch("http://localhost:8080/otp/current-user", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(response => {
      if (!response.ok) throw new Error("Not authorized");
      return response.json();
    })
    .then(data => {
      if (data.status !== "success" || !data.userData) throw new Error("Invalid user data");

      const user = data.userData;
      document.getElementById("ownerName").textContent = user.name || "N/A";
      document.getElementById("ownerMobile").textContent = user.moNumber || "N/A";
      document.getElementById("pgName").textContent = user.pgName || "N/A";
      document.getElementById("city").textContent = user.city?.name || "N/A";
      document.getElementById("address").textContent = user.address || "N/A";

      if (data.profileImageUrl) {
        fetch(`http://localhost:8080/otp${data.profileImageUrl}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(imgResponse => imgResponse.blob())
          .then(blob => {
            document.getElementById("profileImage").src = URL.createObjectURL(blob);
          })
          .catch(() => { document.getElementById("profileImage").src = "images/pg-placeholder.jpg"; });
      }

      document.getElementById("totalGuests").innerText = user.totalGuests || 0;
      document.getElementById("vacantRooms").innerText = user.vacantRooms || 0;
      document.getElementById("currentBookings").innerText = user.currentBookings || 0;
      document.getElementById("pendingPayments").innerText = user.pendingPayments || 0;

      const guestTableBody = document.getElementById("guestTableBody");
      if (user.guests && Array.isArray(user.guests)) {
        user.guests.forEach(guest => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${guest.name}</td>
            <td>${guest.mobile}</td>
            <td>${guest.room}</td>
            <td>${guest.checkinDate}</td>
            <td>${guest.status}</td>
          `;
          guestTableBody.appendChild(tr);
        });
      }

      //  Fetch Guest Requests after user loaded
      fetchGuestRequests(token);
    })
    .catch(error => {
      console.error("Error fetching user", error);
      alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
      window.location.href = "login.html";
    });
});

// Fetch Guest Requests
function fetchGuestRequests(token) {
  fetch("http://localhost:8080/otp/guest-requests", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("requestsContainer");
      container.innerHTML = "";

      if (data.status === "success" && data.requests.length > 0) {
        data.requests.forEach(req => {
          const card = document.createElement("div");
          card.className = "request-card";
          card.innerHTML = `
           <div class="guest-info">
    <img src="http://localhost:8080/otp${req.profileImageUrl}"
    
         alt="Guest Profile" class="guest-profile"/>
    <div class="guest-details">
      <p><strong>Guest Name:</strong> ${req.guestName}</p>
      <p><strong>Temporary Address:</strong> ${req.taddress}</p>
      <p><strong>Permanent Address:</strong> ${req.paddress}</p>
      <p><strong>Mobile:</strong> ${req.guestMobile}</p>
      <button onclick="acceptRequest(${req.requestId})">Accept</button>
    </div>
  </div>
          `;
          container.appendChild(card);
        });
      } else {
        container.innerHTML = `<p>No pending requests</p>`;
      }
    });
}



function acceptRequest(requestId) {
  document.getElementById("assignModal").style.display = "block";
  document.getElementById("currentRequestId").value = requestId;
}

function closeAssignModal() {
  document.getElementById("assignModal").style.display = "none";
}

function submitAssignment() {
  const requestId = document.getElementById("currentRequestId").value;
  const roomNumber = document.getElementById("roomNumber").value;
  const buildingNumber = document.getElementById("buildingNumber").value;
  const address = document.getElementById("roomAddress").value;

  const token = localStorage.getItem("jwtToken");

  fetch(`http://localhost:8080/otp/accept-and-assign/${requestId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ roomNumber, buildingNumber, address })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    closeAssignModal();
    fetchGuestRequests(token);
  })
  .catch(err => console.error(err));
}





// Logout function
function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "home.html";
}
