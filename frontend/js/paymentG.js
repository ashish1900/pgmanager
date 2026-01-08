const token = localStorage.getItem("jwtToken");
if (!token) {
  alert("Login required!");
  window.location.href = "login.html";
}

const pgDropdown = document.getElementById("pgDropdown");
const paymentType = document.getElementById("paymentType");
const payMobile = document.getElementById("payMobile");
const payUpiId = document.getElementById("payUpiId");
const qrImage = document.getElementById("qrImage");
const uploadPaymentBtn = document.getElementById("uploadPaymentBtn");
const paymentScreenshot = document.getElementById("paymentScreenshot");
const historyBody = document.getElementById("historyBody");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");
const historyContainer = document.getElementById("historyContainer");
const paymentContainer = document.getElementById("paymentContainer");
const backToPayBtn = document.getElementById("backToPayBtn");
const filterButtons = document.querySelectorAll(".filter-btn");


const BASE_URL = "http://localhost:8080/otp";

function resolveUrl(url) {
  if (!url) return "/images/default.png";

  //  Cloudinary / full URL
  if (url.startsWith("http")) {
    return url;
  }

  //  Local backend path
  return BASE_URL + url;
}



// -------------------------------------------
// Safe Fetch
// -------------------------------------------
async function safeFetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}


// -------------------------------------------
// Load Accepted PGs
// -------------------------------------------
async function loadAcceptedPGs() {
  const data = await safeFetchJson("http://localhost:8080/otp/accepted-pgs", {
    headers: { Authorization: `Bearer ${token}` }
  });

  pgDropdown.innerHTML = "";
  data.acceptedPgs?.forEach(pg => {
    const opt = document.createElement("option");
    opt.value = pg.ownerMobile;
    opt.dataset.pgName = pg.pgName;
    opt.textContent = `${pg.pgName} (${pg.city})`;
    pgDropdown.appendChild(opt);
  });

  if (data.acceptedPgs?.length) {
    await fetchOwnerDetails(data.acceptedPgs[0].ownerMobile);
  }
}


// -------------------------------------------
// Fetch Owner Details
// -------------------------------------------
async function fetchOwnerDetails(ownerMobile) {
  const url = `http://localhost:8080/otp/owner-details?ownerMobile=${encodeURIComponent(ownerMobile)}`;
  const data = await safeFetchJson(url, { headers: { Authorization: `Bearer ${token}` } });
  const o = data.ownerDetails;

  document.getElementById("ownerName").textContent = o.name;
  document.getElementById("ownerMobile").textContent = o.moNumber;
  document.getElementById("modalPgName").textContent = o.pgName;
  document.getElementById("ownerCity").textContent = o.city?.name;
  document.getElementById("ownerAddress").textContent = o.address;

  payMobile.textContent = o.moNumber || "—";
  payUpiId.textContent = o.upiId || "—";
  qrImage.src = o.qrCodeUrl ? `http://localhost:8080/otp${o.qrCodeUrl}` : "../images/default-qr.png";

  // Profile Image
  const ownerImg = document.getElementById("ownerImage");
  if (o.moNumber) {
    const imgUrl = `http://localhost:8080/otp/profileImage?ownerMobile=${o.moNumber}`;
    try {
      const imgRes = await fetch(imgUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        ownerImg.src = URL.createObjectURL(blob);
      } else {
        ownerImg.src = "../images/default-avatar.png";
      }
    } catch {
      ownerImg.src = "../images/default-avatar.png";
    }
  } else {
    ownerImg.src = "../images/default-avatar.png";
  }
}



// -------------------------------------------
// Upload Payment
// -------------------------------------------
uploadPaymentBtn.addEventListener("click", async () => {
  const file = paymentScreenshot.files[0];
  const amount = document.getElementById("paymentAmount").value.trim();
  const selectedType = paymentType.value;
  const selectedOwnerMobile = pgDropdown.value;

  if (!file || !selectedType || !selectedOwnerMobile || !amount) {
    alert("⚠️ Please select payment type, enter amount, and upload screenshot.");
    return;
  }

  const normalizedType = selectedType.replace(/\s+/g, "_").toUpperCase();

  const formData = new FormData();
  formData.append("ownerMobile", selectedOwnerMobile);
  formData.append("paymentType", normalizedType);
  formData.append("amount", amount);
  formData.append("screenshot", file);

  try {
    const res = await fetch("http://localhost:8080/otp/upload-payment", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert("✅ Payment uploaded successfully! Waiting for owner verification.");
      document.getElementById("paymentAmount").value = "";
      paymentScreenshot.value = "";
    } else {
      const errText = await res.text();
      alert("❌ Upload failed: " + errText);
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Error uploading payment. Try again later.");
  }
});



// -------------------------------------------
// View Payment History (HIDE TOP BUTTON)
// -------------------------------------------
viewHistoryBtn.addEventListener("click", async () => {

  // Hide main payment area
  paymentContainer.classList.add("hidden");
  historyContainer.classList.remove("hidden");

  // Hide top-right payment history button
  document.querySelector(".history-top-btn").style.display = "none";

  // Load table
  await loadPaymentHistory("all");
});


// -------------------------------------------
// Back to Payment (SHOW TOP BUTTON)
// -------------------------------------------
backToPayBtn.addEventListener("click", () => {

  // Hide history, show payment panel
  historyContainer.classList.add("hidden");
  paymentContainer.classList.remove("hidden");

  // Show top-right button again
  document.querySelector(".history-top-btn").style.display = "block";
});




// -------------------------------------------
// Load Payment History for SELECTED PG
// -------------------------------------------
async function loadPaymentHistory(filter = "all") {

  historyBody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

  const selectedOwnerMobile = pgDropdown.value;

  const res = await safeFetchJson(
    `http://localhost:8080/otp/payment-history?ownerMobile=${encodeURIComponent(selectedOwnerMobile)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  let list = res.history || [];

  // Filter (all, rent, advance...)
  if (filter !== "all") list = list.filter(p => p.type === filter);

  //  Sort by latest payment date (descending)
  list.sort((a, b) => {
    const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
    const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
    return dateB - dateA; // latest first
  });

  if (!list.length) {
    historyBody.innerHTML = "<tr><td colspan='7'>No records found.</td></tr>";
    return;
  }

  historyBody.innerHTML = "";

  list.forEach((p, index) => {
    const tr = document.createElement("tr");
    const serialNumber = index + 1;


    function formatDateTime(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const date = d.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
      const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
      return `${date}<br><small style="color:#6b7280;">${time}</small>`;
    }

    tr.innerHTML = `
  <td>${serialNumber}</td>
  <td>${p.pgName || "—"}</td>
  <td>${p.type}</td>
  <td>₹${p.amount}</td>
  <td>${formatDateTime(p.paymentDate)}</td>
  <td>${formatDateTime(p.verifiedDate)}</td>
  <td><span class="status ${p.status.toLowerCase()}">${p.status}</span></td>
  <td>
    <button class="view-receipt-btn" data-url="${resolveUrl(p.receiptUrl)}">
      🧾 View
    </button>
  </td>
`;



    historyBody.appendChild(tr);
  });
}




// -------------------------------------------
// View Receipt Modal
// -------------------------------------------
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-receipt-btn")) {
    const imageUrl = e.target.getAttribute("data-url");
    const modal = document.createElement("div");
    modal.className = "receipt-modal";
    modal.innerHTML = `
      <div class="receipt-modal-content">
        <span class="close-btn">&times;</span>
        <img src="${imageUrl}" alt="Receipt Image" />
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close-btn").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (evt) => {
      if (evt.target === modal) modal.remove();
    });
  }
});



// -------------------------------------------
// Filter Buttons
// -------------------------------------------
filterButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    await loadPaymentHistory(btn.dataset.type);
  });
});


// -------------------------------------------
// PG Dropdown Change → reload owner + history
// -------------------------------------------
pgDropdown.addEventListener("change", async () => {

    //  RESET PAYMENT TYPE WHEN OWNER CHANGES
  paymentType.value = "";

  // Reset Step 2
  const msg = document.getElementById("noPaymentTypeMsg");
  const leftBlock = document.getElementById("upiLeftDetails");
  const qrBlock = document.getElementById("qrBox");

  msg.classList.remove("hidden");
  msg.innerHTML = "<p>⚠️ Please select a payment type to view UPI details.</p>";

  leftBlock.classList.add("hidden");
  qrBlock.classList.add("hidden");

  // Reset Step 3
  document.getElementById("paymentAmount").value = "";
  document.getElementById("paymentScreenshot").value = "";

  document.getElementById("paymentAmount").disabled = true;
  document.getElementById("paymentScreenshot").disabled = true;
  document.getElementById("uploadPaymentBtn").disabled = true;
  document.getElementById("uploadPaymentBtn").style.opacity = "0.5";


  await fetchOwnerDetails(pgDropdown.value);
  await loadPaymentHistory("all");
});


// -------------------------------------------
// Initial Load
// -------------------------------------------
loadAcceptedPGs().catch(console.error);



// -------------------------------------------
// Payment Method Change
// -------------------------------------------

paymentType.addEventListener("change", async () => {

  const selectedType = paymentType.value;
  const selectedOwnerMobile = pgDropdown.value;

  const msg = document.getElementById("noPaymentTypeMsg");
  const leftBlock = document.getElementById("upiLeftDetails");
  const qrBlock = document.getElementById("qrBox");

  const amountInput = document.getElementById("paymentAmount");
  const fileInput = document.getElementById("paymentScreenshot");
  const submitBtn = document.getElementById("uploadPaymentBtn");

  // Reset Step-3 state
  amountInput.disabled = false;
  fileInput.disabled = false;
  submitBtn.disabled = false;
  submitBtn.style.opacity = "1";

  // If type not selected → hide details
  if (!selectedType) {
    msg.classList.remove("hidden");
    msg.innerHTML = `<p>⚠️ Please select a payment type to view UPI details.</p>`;

    leftBlock.classList.add("hidden");
    qrBlock.classList.add("hidden");

    // Disable Step-3
    amountInput.disabled = true;
    fileInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
    return;
  }

  if (!selectedOwnerMobile) return;

  const normalizedType = selectedType.replace(/\s+/g, "_").toUpperCase();

  try {
    const url =
      `http://localhost:8080/otp/payment-method/by-mobile?ownerMobile=${encodeURIComponent(selectedOwnerMobile)}&paymentType=${encodeURIComponent(normalizedType)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();


    // =====================================================
    //  CASE 1 — GUEST REMOVED / REJECTED / PENDING / NO REQUEST
    // =====================================================
    if (data.status !== "ACCEPTED") {

      msg.classList.remove("hidden");
      msg.innerHTML = `
        <p style="color:red; font-weight:bold; font-size:16px; text-align:center;">
          ❌ ${data.message}
        </p>
      `;

      leftBlock.classList.add("hidden");
      qrBlock.classList.add("hidden");

      //  Disable STEP 3
      amountInput.disabled = true;
      fileInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";

      return;
    }


    // =====================================================
    //  CASE 2 — ACCEPTED → SHOW ALL PAYMENT DETAILS
    // =====================================================

    payMobile.textContent = data.ownerMobile || "—";
    payUpiId.textContent = data.upiId || "—";
    qrImage.src = data.qrCodeUrl ? data.qrCodeUrl : "../images/default-qr.png";

    msg.classList.add("hidden");
    leftBlock.classList.remove("hidden");
    qrBlock.classList.remove("hidden");

    // Enable Step 3
    amountInput.disabled = false;
    fileInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";

  } catch (err) {
    console.error(err);
    msg.classList.remove("hidden");
    msg.innerHTML = `<p style="color:red;">⚠️ Error fetching UPI info.</p>`;

    leftBlock.classList.add("hidden");
    qrBlock.classList.add("hidden");

    // Disable Step-3
    amountInput.disabled = true;
    fileInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
  }
});








// -------------------------------------------
// BACK BUTTON → Go to Guest Dashboard
// -------------------------------------------
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html"; 
});
