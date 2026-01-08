// PREVENT BACK NAVIGATION — FORCE LOGOUT ON BACK
(function () {
  history.pushState(null, "", location.href);

  window.addEventListener("popstate", function () {
    logout();   //  back press = logout
  });
})();

  // DASHBOARD LOAD
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("You are not login please login first");
        window.location.href = "home.html";
        return;
    }

    loadDashboardInfo(token);
    fetchActiveGuestsCount(token);
    fetchTotalGuestsCount(token);
    fetchRequestsCountOnly(token);
    fetchLeaveRequestCount(token);
    fetchPendingPaymentCount(token);
    fetchNoticeCount(token);


    fetchCurrentMonthPayment(token);    //  Payment Card (Month Only)
    setupYearDropdown();                //  Year dropdown create
    loadMonthWiseGraph(token);          //  Graph load

    // Auto-refresh every 150 sec
    setInterval(() => {
        fetchActiveGuestsCount(token);
        fetchTotalGuestsCount(token);
        fetchRequestsCountOnly(token);
        fetchLeaveRequestCount(token);
        fetchPendingPaymentCount(token);
        fetchNoticeCount(token);

        fetchCurrentMonthPayment(token);
        loadMonthWiseGraph(token);
    }, 150000);

    // Page redirects

    document.getElementById("activeGuestsCard").onclick = () => {

  //  CLEAR ACTIVE GUEST STATE
  sessionStorage.removeItem("AG_SCROLL");
  sessionStorage.removeItem("AG_FILTER");
  sessionStorage.removeItem("AG_CYCLE_FILTER");

  window.location.href = "activeGuest.html";
};


    document.getElementById("totalGuestsCard").onclick = () => {

    //  CLEAR TOTAL GUEST STATE (IMPORTANT)
    sessionStorage.removeItem("TG_SCROLL");
    sessionStorage.removeItem("TG_FILTER");
    sessionStorage.removeItem("TG_CYCLE_FILTER");

    window.location.href = "totalGuest.html";
};

    document.getElementById("pendingRequestsCard").onclick = () => window.location.href = "pendingRequests.html";
    document.getElementById("pendingLeaveRequestCard").onclick = () => window.location.href = "leaveRequest.html";
    document.getElementById("paymentCard").onclick = () => window.location.href = "paymentO.html";
    document.getElementById("PendingPaymentCard").onclick = () => window.location.href = "pendingPayment.html";
    document.getElementById("NoticeCard").onclick = () => window.location.href = "notice.html";

});


/* ============================================================
   USER INFO LOAD
============================================================ */
function loadDashboardInfo(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/current-user", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            const user = data.userData;

            document.getElementById("ownerName").textContent = user.name;
            document.getElementById("ownerMobile").textContent = user.moNumber;
            document.getElementById("pgName").textContent = user.pgName;
            document.getElementById("city").textContent = user.city?.name;
            document.getElementById("address").textContent = user.address;

            if (data.profileImageUrl) {
    document.getElementById("profileImage").src = data.profileImageUrl;
} else {
    document.getElementById("profileImage").src =
        "../images/pg-placeholder.jpg";
}

        });
}


/* ============================================================
   CARD COUNTS
============================================================ */
function fetchRequestsCountOnly(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/guest-requests", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            document.getElementById("pendingRequestsCount").textContent =
                (data.requests || []).length;
        });
}

function fetchTotalGuestsCount(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/all-guest", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            document.getElementById("totalGuests").textContent =
                (data.requests || []).length;
        });
}

function fetchActiveGuestsCount(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/all-guest", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {

        const list = data.requests || [];

        // ONLY Accepted / Active Guests
        const acceptedCount = list.filter(g => g.status === "ACCEPTED").length;

        document.getElementById("activeGuests").textContent = acceptedCount;
    });
}


function fetchLeaveRequestCount(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/pending-leave-request", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            document.getElementById("pendingLeaveRequest").textContent =
                (data.requests || []).length;
        });
}

function fetchPendingPaymentCount(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/pending-payments", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            const pending = data.payments || data.history || [];
            document.getElementById("PendingPaymentCount").textContent =
                pending.length;
        });
}



function fetchNoticeCount(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/notices", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        const notices = Array.isArray(data) ? data : [];
        document.getElementById("NoticeCount").textContent = notices.length;
    })
    .catch(err => {
        console.error("Error fetching notice count:", err);
        document.getElementById("NoticeCount").textContent = "0";
    });
}



/* ============================================================
    PAYMENT CARD — CURRENT MONTH ONLY
============================================================ */
function fetchCurrentMonthPayment(token) {
    fetch("https://pgmanagerbackend.onrender.com/otp/payment-historyO", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();

            let total = 0;

            (data.history || []).forEach(p => {
                const d = new Date(p.paymentDate);

                if (p.status === "Verified" &&
                    d.getMonth() === month &&
                    d.getFullYear() === year) {
                    total += Number(p.amount);
                }
            });

            document.getElementById("paymentCount").innerHTML =
                `₹${total.toLocaleString("en-IN")}<br>
                 <small class="small-month">
                     ${formatMonthYear(now)}
                 </small>`;
        });
}

function formatMonthYear(date) {
    return date.toLocaleString("en-US", { month: "short" }) + " " + date.getFullYear();
}


   // YEAR DROPDOWN
 
function setupYearDropdown() {
    const yearSelect = document.getElementById("yearSelect");
    yearSelect.innerHTML = "";

    for (let y = 2025; y <= 2030; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    yearSelect.value = new Date().getFullYear();
}


/*  MONTHWISE GRAPH */
let paymentChart = null;

function loadMonthWiseGraph(token) {
    const selectedYear = Number(document.getElementById("yearSelect").value);

    fetch("https://pgmanagerbackend.onrender.com/otp/payment-historyO", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(data => {
            const monthly = new Array(12).fill(0);

            (data.history || []).forEach(p => {
                const d = new Date(p.paymentDate);

                if (p.status === "Verified" && d.getFullYear() === selectedYear) {
                    monthly[d.getMonth()] += Number(p.amount);
                }
            });

            document.getElementById("paymentGraphTitle").textContent =
                `Monthly Payment Trends (${selectedYear})`;

            if (paymentChart) paymentChart.destroy();

            const ctx = document.getElementById("paymentMonthChart").getContext("2d");

            paymentChart = new Chart(ctx, {
                type: "bar",
                plugins: [ChartDataLabels],
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [{
                        label: "Payments",
                        data: monthly,
                        backgroundColor: "#6b8bff"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        datalabels: {
                            anchor: "end",
                            align: "top",
                            color: "#000",
                            font: {
                                size: 11,
                                weight: "bold"
                            },
                            formatter: v => "₹" + v.toLocaleString("en-IN")
                        }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        });
}

// Reload graph on year change
document.getElementById("yearSelect").addEventListener("change", () => {
    const token = localStorage.getItem("jwtToken");
    loadMonthWiseGraph(token);
});


function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
}

document.querySelectorAll(".sidebar .menu li").forEach(item => {
    item.addEventListener("click", () => {
        if (window.innerWidth < 820) {
            toggleSidebar();
        }
    });
});



function logout() {
  try {
    //  Clear auth + user data
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("currentUser");

    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error("Logout error:", e);
  }

  //  HARD redirect (no back possible)
  window.location.replace("home.html");
}




















document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("jwtToken");

  const imageInput = document.getElementById("editProfileImage");
  const previewImg = document.getElementById("profilePreview");
  const imageError = document.getElementById("imageErrorMsg");



  const profileBtn = document.getElementById("myProfileBtn");
  const profileModal = document.getElementById("profileModal");
  const closeProfileBtn = document.getElementById("closeProfileModal");

  const openUpdateBtn = document.getElementById("openUpdateProfileBtn");
  const updateModal = document.getElementById("updateProfileModal");
  const closeUpdateBtn = document.getElementById("closeUpdateProfileModal");
  const saveBtn = document.getElementById("saveProfileBtn");


  const changePhotoBtn = document.getElementById("changePhotoBtn");

changePhotoBtn.addEventListener("click", () => {
  imageInput.click();   // open file picker
});


  /* ===============================
     OPEN PROFILE MODAL
  =============================== */
  if (profileBtn) {
    profileBtn.addEventListener("click", openProfileModal);
  }

  if (closeProfileBtn) {
    closeProfileBtn.addEventListener("click", () => {
      profileModal.classList.remove("show");
    });
  }

  profileModal.addEventListener("click", (e) => {
    if (e.target === profileModal) {
      profileModal.classList.remove("show");
    }
  });

  /* ===============================
     OPEN UPDATE PROFILE MODAL
  =============================== */
  if (openUpdateBtn) {
    openUpdateBtn.addEventListener("click", () => {
      profileModal.classList.remove("show");
      openUpdateProfileModal();
    });
  }

  if (closeUpdateBtn) {
    closeUpdateBtn.addEventListener("click", () => {
      updateModal.classList.remove("show");
    });
  }

  updateModal.addEventListener("click", (e) => {
    if (e.target === updateModal) {
      updateModal.classList.remove("show");
    }
  });

  if (imageInput) {
  imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    // reset
    imageError.style.display = "none";
    previewImg.style.display = "none";

    if (!file) return;

    //  1 MB size check
    if (file.size > 1024 * 1024) {
      imageError.textContent = "Image size must be less than 1 MB.";
      imageError.style.display = "block";
      imageInput.value = "";   // reject image
      return;
    }

    //  type safety
    if (!file.type.startsWith("image/")) {
      imageError.textContent = "Please select a valid image file.";
      imageError.style.display = "block";
      imageInput.value = "";
      return;
    }

    //  preview
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}

 

  /* ===============================
     SAVE PROFILE
  =============================== */
  if (saveBtn) {
    saveBtn.addEventListener("click", saveProfile);
  }

  /* ===============================
     FUNCTIONS
  =============================== */

  function openProfileModal() {

    fetch("https://pgmanagerbackend.onrender.com/otp/current-user", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        const user = data.userData;

        document.getElementById("profilePgName").textContent = user.pgName || "-";
        document.getElementById("profileName").textContent = user.name || "-";
        document.getElementById("profileMobile").textContent = user.moNumber || "-";
        document.getElementById("profileCity").textContent = user.city?.name || "-";
        document.getElementById("profileAddress").textContent = user.address || "-";

        if (data.profileImageUrl) {
  document.getElementById("profileModalImage").src =
    data.profileImageUrl;
}


        profileModal.classList.add("show");
      });
  }

  function openUpdateProfileModal() {

    fetch("https://pgmanagerbackend.onrender.com/otp/current-user", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        const user = data.userData;

        document.getElementById("editPgName").value = user.pgName || "";
        document.getElementById("editOwnerName").value = user.name || "";
        document.getElementById("editMobile").value = user.moNumber || "";
        document.getElementById("editCity").value = user.city?.name || "";
        document.getElementById("editAddress").value = user.address || "";

       if (data.profileImageUrl) {
  previewImg.src = data.profileImageUrl;
  previewImg.style.display = "block";
} else {
  previewImg.style.display = "none";
}



        updateModal.classList.add("show");
      });
  }

  function saveProfile() {

    const formData = new FormData();
    formData.append("pgName", document.getElementById("editPgName").value.trim());
    formData.append("name", document.getElementById("editOwnerName").value.trim());
    formData.append("address", document.getElementById("editAddress").value.trim());

    const img = document.getElementById("editProfileImage").files[0];
if (img) {
  if (img.size > 1024 * 1024) return;
  formData.append("profileImage", img);
}

    fetch("https://pgmanagerbackend.onrender.com/otp/update-owner-profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(resp => {

        if (resp.status !== "success") {
          alert(resp.message || "Update failed");
          return;
        }

        updateModal.classList.remove("show");
        openProfileModal(); // refresh view
        loadDashboardInfo(token);
      });
  }

});
