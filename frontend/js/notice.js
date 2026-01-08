function formatNoticeDateTime(dateStr) {
  const date = new Date(dateStr);

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
  .toUpperCase();
  

  return { datePart, timePart };
}


console.log("✅ notice.js loaded");

const token = localStorage.getItem("jwtToken");

//  Auth guard
if (!token) {
  window.location.replace("home.html");
}

//  Back button
function goBack() {
  window.location.href = "dashboard2.html";
}

// ===============================
// LOAD NOTICES (OWNER + GUEST)
// ===============================
loadNotices();

function loadNotices() {

  fetch("https://pgmanagerbackend.onrender.com/otp/notices", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    console.log("notices =", data);

    const list = document.getElementById("noticeList");
    const addBtn = document.getElementById("addBtn");
    const info = document.getElementById("infoMsg");

    list.innerHTML = "";

    //  No notices
    if (!data || data.length === 0) {
      list.innerHTML = `<p style="color:gray">No notices available</p>`;
    }

    //  Max 5 notice UX (backend final authority)
    if (data.length >= 5) {
  addBtn.disabled = false;
  info.textContent = "";   //  yahan message nahi
} else {
  addBtn.disabled = false;
  info.textContent = "";
}


    // Render notices
    data.forEach(n => {
      list.innerHTML += `
        <div class="notice-card">
          <p>${n.message}</p>
${(() => {
  const { datePart, timePart } = formatNoticeDateTime(n.updatedAt);
  return `
    <small class="notice-date">
      <span class="date">${datePart}</span>,
      <span class="time">${timePart}</span>
    </small>
  `;
})()}

          <div class="notice-actions">
            <button onclick="updateNotice(${n.id})">Update</button>
            <button onclick="deleteNotice(${n.id})">Delete</button>
          </div>
        </div>
      `;
    });

  })
  .catch(err => {
    console.error("❌ notice fetch error", err);
  });
}



// ===============================
// ADD NOTICE (OWNER ONLY – BACKEND CHECK)
// ===============================
document.getElementById("addBtn")?.addEventListener("click", () => {

  console.log("➕ Add Notice clicked");

  const msg = document.getElementById("noticeMsg").value.trim();
  const info = document.getElementById("infoMsg");

  if (!msg) {
    alert("Notice message cannot be empty");
    return;
  }

  //  UX FIX: 6th notice try par message dikhao
  if (document.querySelectorAll(".notice-card").length >= 5) {
    info.textContent = "The maximum limit of 5 notices has been reached. Please update or delete an existing notice to add a new one.";
    return;
  }

  info.textContent = "";

  fetch("https://pgmanagerbackend.onrender.com/otp/owner/add-notice", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      message: msg
    })
  })
  .then(res => res.json())
  .then(resp => {

    if (resp.status === "error" || resp.status === "limit") {
      info.textContent = resp.message;
      return;
    }

    document.getElementById("noticeMsg").value = "";
    loadNotices();
  })
  .catch(err => console.error("❌ add notice error", err));
});





// ===============================
// UPDATE NOTICE (OWNER ONLY)
// ===============================
function updateNotice(id) {

  const msg = prompt("Update notice");
  if (!msg) return;

  fetch("https://pgmanagerbackend.onrender.com/otp/owner/update-notice", {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      noticeId: id,
      message: msg
    })
  })
  .then(res => res.json())
  .then(resp => {

    console.log("update response =", resp);

    if (resp.status === "error") {
      alert(resp.message);
      return;
    }

    loadNotices();
  })
  .catch(err => console.error("❌ update error", err));
}

// ===============================
// DELETE NOTICE (OWNER ONLY)
// ===============================
function deleteNotice(id) {

  if (!confirm("Delete this notice?")) return;

  fetch(`https://pgmanagerbackend.onrender.com/otp/owner/delete-notice?noticeId=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(resp => {

    console.log("delete response =", resp);

    if (resp.status === "error") {
      alert(resp.message);
      return;
    }

    loadNotices();
  })
  .catch(err => console.error("❌ delete error", err));
}
