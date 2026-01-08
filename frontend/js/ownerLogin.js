const token = localStorage.getItem("jwtToken");

if (!token) {
  window.location.replace("home.html");
}

function goBack() {
  window.location.href = "dashboard2.html";
}

//  get current user role
fetch("https://pgmanagerbackend.onrender.com/otp/current-user", {
  headers: { Authorization: "Bearer " + token }
})
.then(r => r.json())
.then(data => {
  const role = data.role; // OWNER or GUEST
  if (role !== "OWNER") {
    document.getElementById("ownerBox").style.display = "none";
  }
  loadNotices(role);
});

function loadNotices(role) {
  fetch("https://pgmanagerbackend.onrender.com/otp/notices", {
    headers: { Authorization: "Bearer " + token }
  })
  .then(r => r.json())
  .then(data => {
    const list = document.getElementById("noticeList");
    list.innerHTML = "";

    if (role === "OWNER") {
      document.getElementById("addBtn").disabled = data.length >= 5;
      document.getElementById("infoMsg").textContent =
        data.length >= 5
          ? "Maximum 5 notices allowed. Update any existing notice."
          : "";
    }

    data.forEach(n => {
      list.innerHTML += `
        <div class="notice-card">
          <p>${n.message}</p>
          <small>${new Date(n.updatedAt).toLocaleString()}</small>

          ${role === "OWNER" ? `
            <div class="notice-actions">
              <button onclick="updateNotice(${n.id})">Update</button>
              <button onclick="deleteNotice(${n.id})">Delete</button>
            </div>
          ` : ""}
        </div>
      `;
    });
  });
}

document.getElementById("addBtn")?.addEventListener("click", () => {
  const msg = document.getElementById("noticeMsg").value.trim();
  if (!msg) return alert("Notice cannot be empty");

  fetch("https://pgmanagerbackend.onrender.com/otp/owner/add-notice", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ message: msg })
  }).then(() => {
    document.getElementById("noticeMsg").value = "";
    loadNotices("OWNER");
  });
});

function updateNotice(id) {
  const msg = prompt("Update notice");
  if (!msg) return;

  fetch("https://pgmanagerbackend.onrender.com/otp/owner/update-notice", {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ noticeId: id, message: msg })
  }).then(() => loadNotices("OWNER"));
}

function deleteNotice(id) {
  if (!confirm("Delete this notice?")) return;

  fetch(`https://pgmanagerbackend.onrender.com/otp/owner/delete-notice?noticeId=${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  }).then(() => loadNotices("OWNER"));
}
