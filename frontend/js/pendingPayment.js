let paymentList = [];
let currentGuestIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Login required!");
    window.location.href = "login.html";
    return;
  }

  const tbody = document.getElementById("pendingPaymentsBody");
  const modal = document.getElementById("receiptModal");
  const receiptImg = document.getElementById("receiptImage");
  const closeBtn = document.getElementById("closeReceiptBtn");
  const modalButtons = document.getElementById("modalActionButtons");
  const infoModal = document.getElementById("infoModal");
  const closeInfoBtn = document.getElementById("closeBtn");

  document.getElementById("backBtn").addEventListener("click", () => window.location.href = "dashboard2.html");
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  closeInfoBtn.addEventListener("click", closeInfoModal);

  loadPendingPayments(token);

  function loadPendingPayments(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/pending-payments", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";
        const payments = data.history || data.payments || [];
        paymentList = payments;

        payments.sort((a, b) => {
  const d1 = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
  const d2 = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
  return d2 - d1; // latest first
});


        if (payments.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8">No pending payments found</td></tr>`;
          return;
        }


        payments.forEach((p, i) => {
          const payDate = p.paymentDate ? new Date(p.paymentDate) : null;
          const formattedDate = payDate
            ? `${payDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}<br><small>${payDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>`
            : "—";

          const row = document.createElement("tr");
          row.innerHTML = `
          <td>${i + 1}</td>
            <td class="name-cell">
              <span>${p.guestName || "—"}</span>
              <button class="see-btn" data-index="${i}" >
                <i class="fa-solid fa-eye"></i> See
              </button>
            </td>
            <td>${p.type || "—"}</td>
            <td>₹${p.amount || 0}</td>
            <td>${formattedDate}</td>
            <td>${p.status || "Pending"}</td>
            <td>
              <button class="view-receipt-btn" data-url="https://pgmanagerbackend.onrender.com/otp${p.receiptUrl}" data-id="${p.id}">🧾 View & Verify</button>
            </td>
            <td style=display:none>
              <button class="verify-btn" data-id="${p.id}">✅ Verify</button>
              <button class="reject-btn" data-id="${p.id}">❌ Reject</button>
            </td>
          `;
          tbody.appendChild(row);
        });



        

        document.querySelectorAll(".see-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const index = e.target.closest(".see-btn").dataset.index;
            openInfoModal(index);
          });
        });

        document.querySelectorAll(".view-receipt-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            openReceiptModal(e.target.dataset.url, e.target.dataset.id);
          });
        });

        document.querySelectorAll(".verify-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const id = e.target.dataset.id;
            const url = e.target.closest("tr").querySelector(".view-receipt-btn").dataset.url;
            openReceiptModal(url, id);
          });
        });

        document.querySelectorAll(".reject-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const id = e.target.dataset.id;
            const url = e.target.closest("tr").querySelector(".view-receipt-btn").dataset.url;
            openReceiptModal(url, id);
          });
        });
      })
      .catch(err => console.error("Error loading payments:", err));
  }

  function openReceiptModal(url, paymentId) {
    receiptImg.src = url || "../images/default-qr.png";
    modalButtons.innerHTML = `
      <button id="modalVerifyBtn" class="verify-modal-btn">✅ Verify</button>
      <button id="modalRejectBtn" class="reject-modal-btn">❌ Reject</button>
    `;
    modal.classList.add("active");

    document.getElementById("modalVerifyBtn").addEventListener("click", () => updatePaymentStatus(paymentId, "Verified", token));
    document.getElementById("modalRejectBtn").addEventListener("click", () => updatePaymentStatus(paymentId, "Rejected", token));
  }

  function updatePaymentStatus(paymentId, newStatus, token) {
    if (!confirm(`Are you sure you want to mark as ${newStatus}?`)) return;
    fetch(`https://pgmanagerbackend.onrender.com/otp/update-payment-status/${paymentId}?status=${newStatus}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(resp => {
        if (resp.status === "success") {
          alert(`Payment ${newStatus}!`);
          modal.classList.remove("active");
          loadPendingPayments(token);
        } else alert("Failed to update status.");
      })
      .catch(err => console.error(err));
  }

  // ✅ Guest Info Modal (same as leaveRequest)
  function openInfoModal(index) {
    const g = paymentList[index];
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
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.ok ? res.blob() : Promise.reject())
      .then(blob => modalPhoto.src = URL.createObjectURL(blob))
      .catch(() => modalPhoto.src = "default-avatar.png");

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

    loadIDImage(g.idFront, "idFrontImage", token);
    loadIDImage(g.idBack, "idBackImage", token);
  }

  function loadIDImage(fileName, elementId, token) {
    const img = document.getElementById(elementId);
    if (fileName) {
      fetch(`https://pgmanagerbackend.onrender.com/otp/request-id-image?fileName=${fileName}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.ok ? res.blob() : Promise.reject())
        .then(blob => img.src = URL.createObjectURL(blob))
        .catch(() => img.src = "default-id.png");
    } else img.src = "default-id.png";
  }

  function closeInfoModal() {
    const modal = document.getElementById("infoModal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
  }
});


// ✅ Global Image Zoom Feature
function enableFullImageZoom(selector) {
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomImg = document.getElementById("zoomedImage");
  const closeZoom = document.getElementById("zoomCloseBtn");

  document.querySelectorAll(selector).forEach(img => {
    img.style.cursor = "zoom-in";
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

// Call this after DOM load
window.addEventListener("DOMContentLoaded", () => {
  // ... your existing code ...
  // Activate zoom for these images:
  enableFullImageZoom("#receiptImage");
  enableFullImageZoom("#idFrontImage");
  enableFullImageZoom("#idBackImage");
});
