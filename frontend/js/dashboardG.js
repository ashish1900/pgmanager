window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    alert("You are not login plese first login");
    window.location.href = "login.html";
    return;
  }

  //  Guest Info Load (YOUR EXISTING)
  fetch("https://pgmanagerbackend.onrender.com/otp/current-guest", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(response => {
      if (!response.ok) throw new Error("Not authorized");
      return response.json();
    })
    .then(data => {
      if (data.status !== "success" || !data.guestData) {
        throw new Error("Invalid user data");
      }

      const user = data.guestData;
      document.getElementById("guestName").textContent = user.name || "N/A";
      document.getElementById("guestMobile").textContent = user.moNumber || "N/A";
    //  document.getElementById("guestTAddress").textContent = user.tAddress || user.taddress || "Not Provided";
      document.getElementById("guestPAddress").textContent = user.pAddress || user.paddress || "Not Provided";

      // Profile Image of guest (secure blob load)
      if (data.profileImageUrl) {
        fetch(`https://pgmanagerbackend.onrender.com/otp${data.profileImageUrl}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(imgResponse => imgResponse.ok ? imgResponse.blob() : Promise.reject())
          .then(blob => {
            document.getElementById("profileImage").src = URL.createObjectURL(blob);
          })
          .catch(() => {
            document.getElementById("profileImage").src = "../images/default-avatar.png";
          });
      }

      //  After guest loaded, try loading owner details (if accepted)
      fetchOwnerDetails(token);
    })
    .catch(error => {
      console.error("Error fetching user", error);
      alert("आप लॉगिन नहीं हैं। कृपया लॉगिन करें।");
      window.location.href = "login.html";
    });

  // See PGs & Load PGs — 
  document.getElementById("seePgsBtn").addEventListener("click", () => {
    document.getElementById("citySection").style.display = "block";

    fetch("https://pgmanagerbackend.onrender.com/otp/cities")
      .then(res => res.json())
      .then(data => {
        let citySelect = document.getElementById("citySelect");
        citySelect.innerHTML = "";
        data.forEach(city => {
          let opt = document.createElement("option");
          opt.value = city.name;
          opt.innerText = city.name;
          citySelect.appendChild(opt);
        });
      });
  });

  document.getElementById("loadPgsBtn").addEventListener("click", () => {
    let city = document.getElementById("citySelect").value;
    const token = localStorage.getItem("jwtToken");

    fetch(`https://pgmanagerbackend.onrender.com/otp/pg-by-city?city=${encodeURIComponent(city)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        let container = document.getElementById("pgList");
        container.innerHTML = "";

        if (data.status === "success") {
          data.pgs.forEach(pg => {
            let div = document.createElement("div");
            div.className = "pg-card";
            div.innerHTML = `
              <h3>${pg.pgName}</h3>
              <p><b>Address:</b> ${pg.pgAddress}</p>
              <p><b>Owner:</b> ${pg.ownerName}</p>
              <button onclick="sendRequest(${pg.pgId})">Send Request</button>
            `;
            container.appendChild(div);
          });
        } else {
          container.innerHTML = `<p>${data.message}</p>`;
        }
      });
  });

  // Copy Owner Number button handler (event delegation)
  document.getElementById("copyOwnerBtn")?.addEventListener("click", () => {
    const num = document.getElementById("ownerMobile").textContent.trim();
    if (num) {
      navigator.clipboard.writeText(num).then(() => {
        alert("Owner number copied!");
      });
    }
  });
});

//  Send Request Function 
function sendRequest(pgId) {
  const token = localStorage.getItem("jwtToken");

  fetch(`https://pgmanagerbackend.onrender.com/otp/send?ownerId=${pgId}&pgId=${pgId}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    });
}

//  Load Owner Details (if accepted)
function fetchOwnerDetails(token) {
  fetch("https://pgmanagerbackend.onrender.com/otp/owner-details", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(async data => {
      const ownerSection = document.getElementById("ownerSection");
      const noOwnerSection = document.getElementById("noOwnerSection");

      if (data.status === "success" && data.ownerDetails) {
        const o = data.ownerDetails;

        // Text fields
        document.getElementById("ownerName").textContent = o.name || "N/A";
        document.getElementById("ownerMobile").textContent = o.moNumber || "N/A";
        document.getElementById("ownerPgName").textContent = o.pgName || "N/A";
        document.getElementById("ownerCity").textContent = (o.city && o.city.name) ? o.city.name : "N/A";
        document.getElementById("ownerAddress").textContent = o.address || "N/A";

        if (data.roomAssignment) {
          document.getElementById("assignedBuilding").textContent = data.roomAssignment.buildingNumber || "N/A";
          document.getElementById("assignedRoom").textContent = data.roomAssignment.roomNumber || "N/A";
          document.getElementById("assignedRoomAddress").textContent = data.roomAssignment.address || "N/A";
          document.getElementById("assignedfloor").textContent = room.floorNumber || "N/A";

        }

        // Call link
        const callBtn = document.getElementById("callOwnerBtn");
        if (o.moNumber) {
          callBtn.href = `tel:${o.moNumber}`;
        } else {
          callBtn.removeAttribute("href");
        }

        //  Updated Image Loading Logic (with ownerMobile query param)
        if (o.moNumber) {
          const profileImageUrl = `https://pgmanagerbackend.onrender.com/otp/profileImage?ownerMobile=${o.moNumber}`;
          try {
            const imgRes = await fetch(profileImageUrl, {
              method: "GET",
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              document.getElementById("ownerImage").src = URL.createObjectURL(blob);
            } else {
              document.getElementById("ownerImage").src = "../images/default-avatar.png";
            }
          } catch (err) {
            console.error("Error loading owner image:", err);
            document.getElementById("ownerImage").src = "../images/default-avatar.png";
          }
        } else {
          document.getElementById("ownerImage").src = "../images/default-avatar.png";
        }

        // Show/Hide sections
        ownerSection.style.display = "block";
        noOwnerSection.style.display = "none";
      } else {
        ownerSection.style.display = "none";
        noOwnerSection.style.display = "block";
      }
    })
    .catch(() => {
      document.getElementById("ownerSection").style.display = "none";
      document.getElementById("noOwnerSection").style.display = "block";
    });
}


//  Logout 
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jwtToken");
  window.location.href = "home.html";
});
