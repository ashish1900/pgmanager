const token = localStorage.getItem("jwtToken");
if (!token) {
  alert("Please login again!");
  window.location.href = "login.html";
}

const historyBody = document.getElementById("historyBody");
const filterButtons = document.querySelectorAll(".filter-btn");

// -------------------------
// Fetch ALL payment history
// -------------------------
async function loadAllPayments(filter = "all") {
  historyBody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";

  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/payment-history", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    let list = data.history || [];

    // Filter
    if (filter !== "all") {
      list = list.filter(p => p.type === filter);
    }

    // Sort by latest date
    list.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    if (list.length === 0) {
      historyBody.innerHTML = "<tr><td colspan='8'>No records found</td></tr>";
      return;
    }

    historyBody.innerHTML = "";

    list.forEach((p, index) => {
      const row = document.createElement("tr");

      function format(date) {
        if (!date) return "—";
        const d = new Date(date);
        return d.toLocaleDateString("en-IN") + "<br><small>" + d.toLocaleTimeString("en-IN") + "</small>";
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${p.pgName}</td>
        <td>${p.type}</td>
        <td>₹${p.amount}</td>
        <td>${format(p.paymentDate)}</td>
        <td>${format(p.verifiedDate)}</td>
        <td><span class="status ${p.status.toLowerCase()}">${p.status}</span></td>
        <td>
          <button class="view-receipt-btn" data-url="https://pgmanagerbackend.onrender.com/otp${p.receiptUrl}">
            View
          </button>
        </td>
      `;

      historyBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    historyBody.innerHTML = "<tr><td colspan='8'>Error loading data</td></tr>";
  }
}

// ----------------------
// Receipt Modal
// ----------------------
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-receipt-btn")) {
    const url = e.target.dataset.url;

    const modal = document.createElement("div");
    modal.className = "receipt-modal";
    modal.style = `
      position:fixed; inset:0; background:rgba(0,0,0,0.6);
      display:flex; justify-content:center; align-items:center;
    `;

    modal.innerHTML = `
      <div style="background:white; padding:10px; border-radius:8px;">
        <span style="float:right; cursor:pointer; font-size:22px;" id="closeX">&times;</span>
        <img src="${url}" style="max-width:100%; max-height:80vh;">
      </div>
    `;

    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target.id === "closeX" || e.target === modal) modal.remove();
    };
  }
});

// ----------------------
// Filter Buttons
// ----------------------
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadAllPayments(btn.dataset.type);
  });
});

// ----------------------
// Back Button
// ----------------------
document.getElementById("backBtn").onclick = () => {
  window.location.href = "dashboard.html";
};

// Initial Load
loadAllPayments("all");
