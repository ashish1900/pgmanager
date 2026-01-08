document.getElementById("verifyOtpForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();
    const message = document.getElementById("message");

    const storedMobile = sessionStorage.getItem("enterdMoNumber");
    if (!storedMobile) {
        message.style.color = "red";
        message.textContent = "No mobile number found.";
        return;
    }

    const { rawMobileNumber } = JSON.parse(storedMobile);
    const mobileNumber = "+91" + rawMobileNumber;

    try {
        const res = await fetch("http://localhost:8080/otp/verify-and-loginG", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobileNumber, otp })
        });

        const result = await res.json();

        if (res.ok && result.status === "login_success") {
            message.style.color = "green";
            message.textContent = result.message;

            // Save token & user data
            localStorage.setItem("jwtToken", result.token);
            localStorage.setItem("currentUser", JSON.stringify(result.user));
            localStorage.setItem("guestId", result.user.id);

            setTimeout(() => window.location.href = "dashboard.html", 1000);

        } else if (result.status === "new_user") {
            message.style.color = "blue";
            message.textContent = result.message;

            setTimeout(() => window.location.href = "registerO.html", 1000);
        } else {
            message.style.color = "red";
            message.textContent = result.message || "Login failed.";
        }
    } catch (error) {
        console.error("Error:", error);
        message.style.color = "red";
        message.textContent = "Server error.";
    }
});
