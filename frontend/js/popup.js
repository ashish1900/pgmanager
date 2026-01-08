document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("mismatchPopup");
  const okBtn = document.getElementById("okBtn");
  const token = localStorage.getItem("jwtToken");
  const guestId = localStorage.getItem("guestId");

  if (!token || !guestId) return;

  let mismatchCleared = false;

  function checkMismatch() {
    if (mismatchCleared) return;
    fetch(`http://localhost:8080/otp/mismatch/${guestId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "MISMATCH") {
          popup.style.display = "flex";
        } else {
          popup.style.display = "none";
        }
      })
      .catch(err => console.error("Mismatch check error:", err));
  }

  checkMismatch();
  setInterval(checkMismatch, 10000);

  okBtn.addEventListener("click", () => {
    fetch(`http://localhost:8080/otp/mismatch/${guestId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Delete failed");
        mismatchCleared = true;
        try {
          await res.json();
        } catch {}
        popup.style.display = "none";
        alert("Please update your ID & details, then send request again.");
      })
      .catch(err => console.error("Mismatch delete error:", err));
  });
});
