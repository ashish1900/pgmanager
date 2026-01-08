form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const otp = document.getElementById("otp").value.trim();
  const message = document.getElementById("message");

  const storedData = sessionStorage.getItem("registerData");
  if (!storedData) {
    message.style.color = "red";
    message.textContent = "No registration data found.";
    return;
  }

  const { name, moNumber, city, pgName, address } = JSON.parse(storedData);

  try {
    const res = await fetch("http://localhost:8080/verify-and-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, name, moNumber, city, pgName, address }),
    });

    const resultText = await res.text();

    if (res.ok && resultText === "Registration successful") {
      message.style.color = "green";
      message.textContent = "Registration successful. Redirecting...";
      sessionStorage.removeItem("registerData");
      setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
      message.style.color = "red";
      message.textContent = resultText;
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Something went wrong.";
  }
});
