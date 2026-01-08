document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sendOtpForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const rawMobileNumber = document.getElementById("mobileNumber").value.trim();

    if (!/^\d{10}$/.test(rawMobileNumber)) {
      message.textContent = "Please enter a valid 10-digit mobile number.";
      message.style.color = "red";
      return;
    }

    try {
      sessionStorage.setItem("enterdMoNumber", JSON.stringify({ rawMobileNumber }));

      const mobileNumber = "+91" + rawMobileNumber;

      const response = await fetch("http://localhost:8080/otp/check-and-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobileNummber: mobileNumber,
          userType: "OWNER"  //  Owner type fixed
        })
      });

      const result = await response.text();

      if (response.ok) {
        if (result === "EXISTS_AND_OTP_SENT") {
          message.textContent = "OTP sent successfully. Redirecting to verification page...";
          message.style.color = "green";
          setTimeout(() => window.location.href = "verify-and-login.html", 1000);

        } else if (result === "NEW_USER") {
          message.textContent = "New owner. Redirecting to registration page...";
          message.style.color = "blue";
          setTimeout(() => window.location.href = "registerO.html", 1000);

        } else {
          message.textContent = "Server returned: " + result;
          message.style.color = "red";
        }
      } else {
        message.textContent = "Error: " + result;
        message.style.color = "red";
      }

    } catch (error) {
      console.error("Error contacting backend:", error);
      message.textContent = "Network or server error.";
      message.style.color = "red";
    }
  });
});
