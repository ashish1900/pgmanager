document.getElementById("verifyOtpForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const otp = document.getElementById("otp").value.trim();
  const message = document.getElementById("message");

  const storedMoNumber = sessionStorage.getItem("enterdMoNumber");
  const storedData = sessionStorage.getItem("registerData");

  if (!storedMoNumber || !storedData) {
    message.style.color = "red";
    message.textContent = "Missing data.";
    return;
  }

  const { rawMobileNumber } = JSON.parse(storedMoNumber);
  const { name, moNumber, city, pgName, address, imageName } = JSON.parse(storedData);

  const formData = new FormData();
  formData.append("otp", otp);
  formData.append("moNumber", rawMobileNumber);
  formData.append("name", name);
  formData.append("city", city);
  formData.append("pgName", pgName);
  formData.append("address", address);
  formData.append("imageName", imageName);

  try {
    const res = await fetch("http://localhost:8080/otp/verify-and-register", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (res.ok && result.status === "registered") {
      localStorage.setItem("jwtToken", result.token);
      sessionStorage.removeItem("registerData");
      message.style.color = "green";
      message.textContent = "Registration successful.";
      setTimeout(() => window.location.href = "dashboard2.html", 1000);
    } else {
      message.style.color = "red";
      message.textContent = result.message || "Error occurred.";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Something went wrong.";
  }
});
