document.getElementById("verifyOtpForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const otp = document.getElementById("otp").value.trim();
  const message = document.getElementById("message");

  const storedMoNumber = sessionStorage.getItem("enterdMoNumber");
  const storedData = sessionStorage.getItem("guestRegisterData");

  if (!storedMoNumber || !storedData) {
    message.style.color = "red";
    message.textContent = "Missing registration data.";
    return;
  }

  const { rawMobileNumber } = JSON.parse(storedMoNumber);
  const { name, paddress, imageName } = JSON.parse(storedData);

  const formData = new FormData();
  formData.append("otp", otp);
  formData.append("moNumber", rawMobileNumber);
  formData.append("name", name);
  formData.append("paddress", paddress);
  formData.append("imageName", imageName);

  try {
    const res = await fetch("https://pgmanagerbackend.onrender.com/otp/verify-and-registerG", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (res.ok && result.status === "registered") {
      // ✅ Save token & guest details
      localStorage.setItem("jwtToken", result.token);

      // If backend returns user info, store it
      if (result.user) {
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        localStorage.setItem("guestId", result.user.id); // <-- Important
      }

      // Cleanup
      sessionStorage.removeItem("guestRegisterData");
      sessionStorage.removeItem("enterdMoNumber");

      message.style.color = "green";
      message.textContent = "Guest registration successful.";

      setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    } else {
      message.style.color = "red";
      message.textContent = result.message || "Error occurred.";
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Something went wrong while verifying OTP.";
  }
});
