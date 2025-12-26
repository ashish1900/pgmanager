document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("verifyOtpForm");
  const messageDiv = document.getElementById("message");

  // URL se mobile number nikaalo
  const urlParams = new URLSearchParams(window.location.search);


  let mobile = urlParams.get("mobile");

  if (!mobile) {
    messageDiv.textContent = "Mobile number missing. Please go back and try again.";
    messageDiv.style.color = "red";
    form.style.display = "none";
    return;
  }

  // ✅ Agar +91 nahi laga hua hai to laga do
  if (!mobile.startsWith("91")) {
    mobile = "+91" + mobile;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const otp = document.getElementById("otp").value;

    try {
      const response = await fetch("https://pgmanagerbackend.onrender.com/otp/verifyOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mobileNumber: mobile,
          otp: otp
        })
      });

      const result = await response.text();

      if (response.ok) {
        messageDiv.textContent = "OTP Verified Successfully!";
        messageDiv.style.color = "green";

        // ✅ Redirect to dashboard or registration based on login/registration flow
        setTimeout(() => {
          window.location.href = "dashboard.html"; // replace with your dashboard or register page
        }, 1000);

      } else {
        messageDiv.textContent = result;
        messageDiv.style.color = "red";
      }

    } catch (error) {
      console.error("OTP Verification Failed:", error);
      messageDiv.textContent = "Server error. Try again.";
      messageDiv.style.color = "red";
    }
  });
});
