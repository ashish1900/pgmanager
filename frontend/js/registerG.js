document.addEventListener("DOMContentLoaded", () => {
  const storedMoNumber = sessionStorage.getItem("enterdMoNumber");
  const mobileSpan = document.getElementById("rawMobileNumber");
  const hiddenInput = document.getElementById("moNumber");

  if (storedMoNumber) {
    const { rawMobileNumber } = JSON.parse(storedMoNumber);
    mobileSpan.textContent = rawMobileNumber;
    hiddenInput.value = rawMobileNumber;
  } else {
    mobileSpan.textContent = "Not Found";
  }

  // Image preview with size check
  const imageInput = document.getElementById("profileImage");
  const imagePreview = document.getElementById("imagePreview");
  const imageName = document.getElementById("imageName");
  const imageError = document.getElementById("imageError");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB <= 1000) {
        imageError.style.display = "none";
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
          imageName.textContent = file.name;
          imageName.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        imageError.style.display = "block";
        imagePreview.style.display = "none";
        imageName.style.display = "none";
        imageInput.value = "";
      }
    } else {
      imagePreview.style.display = "none";
      imageName.style.display = "none";
      imageError.style.display = "none";
    }
  });
});

document.getElementById("guestRegisterForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const message = document.getElementById("message");

  const imageFile = document.getElementById("profileImage").files[0];
  if (!imageFile) {
    message.style.color = "red";
    message.textContent = "Please select a profile image.";
    return;
  }

  const imageFormData = new FormData();
  imageFormData.append("file", imageFile);

  const imageRes = await fetch("http://localhost:8080/otp/upload-temp-image", {
    method: "POST",
    body: imageFormData,
  });
  const imageResult = await imageRes.json();
  const uploadedImageName = imageResult.imageName;

  const name = document.getElementById("name").value.trim();
  const paddress = document.getElementById("paddress").value.trim();
  const moNumber = document.getElementById("moNumber").value.trim();

  const otpRes = await fetch("http://localhost:8080/otp/sendOtp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: "+91" + moNumber, userType: "guest" }),
  });

  const otpText = await otpRes.text();

  if (otpRes.ok) {
    message.style.color = "green";
    message.textContent = otpText;
    sessionStorage.setItem("guestRegisterData", JSON.stringify({
      name,
     // taddress,
      paddress,
      moNumber,
      imageName: uploadedImageName
    }));
    setTimeout(() => window.location.href = "verifyOtpG.html", 1000);
  } else {
    message.style.color = "red";
    message.textContent = otpText;
  }
});
