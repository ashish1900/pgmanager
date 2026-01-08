const token = localStorage.getItem("jwtToken");
if (!token) {
  alert("You are not login please login first");
  window.location.href = "login.html";
}

let paymentHistory = [];
let yearlyChart = null;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* =======================
   INITIAL LOAD
======================= */
document.addEventListener("DOMContentLoaded", () => {
  fetchPayments();
});

/* ======================= FETCH ======================= */
function fetchPayments() {
  fetch("http://localhost:8080/otp/payment-historyO", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => {
      paymentHistory = data.history || [];

      setYearDropdown();
      loadCurrentMonthCards();
      changeGraph("ROOM_RENT");  // default graph
    });
}

/* ======================= YEAR DROPDOWN ======================= */
function setYearDropdown() {
  const y = document.getElementById("yearSelect");
  y.innerHTML = "";

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  years.forEach(yr => {
    const opt = document.createElement("option");
    opt.value = yr;
    opt.textContent = yr;
    y.appendChild(opt);
  });

  y.value = 2026;

  y.addEventListener("change", () => {
    changeGraph(currentActiveType);
  });
}


function getSelectedYear() {
  return Number(document.getElementById("yearSelect").value);
}

/* ======================= MONTH CARDS ======================= */
function loadCurrentMonthCards() {
  const now = new Date();
  const cm = now.getMonth();
  const cy = now.getFullYear();

  document.getElementById("currentMonthText").textContent =
    `This Month: ${MONTHS[cm]} ${cy}`;

  const totals = {
    ROOM_RENT: 0,
    ADVANCE_MONEY: 0,
    ELECTRICITY_BILL: 0,
    WATER_BILL: 0,
    SECURITY_MONEY: 0
  };

  paymentHistory.forEach(p => {
    const d = new Date(p.paymentDate);
    if (d.getMonth() === cm && d.getFullYear() === cy && p.status === "Verified") {
      totals[p.type] += Number(p.amount) || 0;
    }
  });

  updateCard("roomAmount", totals.ROOM_RENT);
  updateCard("advanceAmount", totals.ADVANCE_MONEY);
  updateCard("electricityAmount", totals.ELECTRICITY_BILL);
  updateCard("waterAmount", totals.WATER_BILL);
  updateCard("securityAmount", totals.SECURITY_MONEY);


  const monthYear = `${MONTHS[cm]} ${cy}`;

document.getElementById("roomDate").textContent = monthYear;
document.getElementById("advanceDate").textContent = monthYear;
document.getElementById("electricityDate").textContent = monthYear;
document.getElementById("waterDate").textContent = monthYear;
document.getElementById("securityDate").textContent = monthYear;




}

function updateCard(id, val) {
  document.getElementById(id).textContent =
    "₹" + (val || 0).toLocaleString("en-IN");
}

/* ======================= GRAPH CHANGE ======================== */

let currentActiveType = "ROOM_RENT";

function changeGraph(type) {
  currentActiveType = type;

  const yr = getSelectedYear();
  const monthly = new Array(12).fill(0);

  paymentHistory.forEach(p => {
    const d = new Date(p.paymentDate);

    if (p.status === "Verified" && d.getFullYear() === yr && p.type === type) {
      monthly[d.getMonth()] += Number(p.amount) || 0;
    }
  });

  if (yearlyChart) yearlyChart.destroy();

  const ctx = document.getElementById("yearlyChart").getContext("2d");

  yearlyChart = new Chart(ctx, {
    type: "bar",
    plugins: [ChartDataLabels],  //  IMPORTANT
    data: {
      labels: MONTHS,
      datasets: [{
        label: type.replace(/_/g," "),
        data: monthly,
        backgroundColor: "#4c6fff",
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
            weight: "bold",
            size: 12
          },
          formatter: (value) => "₹" + value.toLocaleString("en-IN")
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => "₹" + v.toLocaleString("en-IN")
          }
        }
      }
    }
});

document.getElementById("graphTitle").textContent =
    type.replace(/_/g," ") + " Trends (" + getSelectedYear() + ")";

  
  highlightActiveButton(type);
}

/* ======================= ACTIVE BUTTON HIGHLIGHT ======================= */
function highlightActiveButton(activeType) {
  document
    .querySelectorAll(".graph-btn")
    .forEach(btn => btn.classList.remove("active"));

  document
    .getElementById("btn_" + activeType)
    .classList.add("active");
}

/* ======================= CARD → NEXT PAGE ======================= */
function goToPayment(type) {
  localStorage.setItem("selectedPaymentType", type);
  window.location.href = "roomRent.html";
}

function goBack() {
  window.history.back();
}
