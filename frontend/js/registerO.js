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

  // Load cities from backend
  fetch("http://localhost:8080/otp/cities")
    .then(res => res.json())
    .then(cities => {
      const datalist = document.getElementById("cityList");
      cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city.name;
        datalist.insertBefore(option, datalist.lastElementChild);
      });
    })
    .catch(err => console.error("Error loading cities:", err));


    
  // Show manual city input if "Other" selected
  const cityInput = document.getElementById("cityInput");
  const manualCityInput = document.getElementById("manualCity");

  cityInput.addEventListener("input", () => {
    if (cityInput.value === "Other (Enter manually)") {
      manualCityInput.style.display = "block";
      manualCityInput.required = true;
    } else {
      manualCityInput.style.display = "none";
      manualCityInput.required = false;
    }
  });

  // Image preview with size check
  const imageInput = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const imageName = document.getElementById("imageName");
  const imageError = document.getElementById("imageError");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const fileSizeKB = file.size / 1024; // size in KB
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
        imageInput.value = ""; // clear the file
      }
    } else {
      imagePreview.style.display = "none";
      imageName.style.display = "none";
      imageError.style.display = "none";
    }
  });
});

// Form submit
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const message = document.getElementById("message");

  const imageFile = document.getElementById("imageUpload").files[0];
  if (!imageFile) {
    message.style.color = "red";
    message.textContent = "Please select an image.";
    return;
  }

  let cityValue = document.getElementById("cityInput").value.trim();
  if (cityValue === "Other (Enter manually)") {
    cityValue = document.getElementById("manualCity").value.trim();
    if (!cityValue) {
      message.style.color = "red";
      message.textContent = "Please enter a city name.";
      return;
    }
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
  const pgName = document.getElementById("pgName").value.trim();
  const address = document.getElementById("address").value.trim();
  const moNumber = document.getElementById("moNumber").value.trim();

  const otpRes = await fetch("http://localhost:8080/otp/sendOtp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: "+91" + moNumber }),
  });

  const otpText = await otpRes.text();

  if (otpRes.ok) {
    message.style.color = "green";
    message.textContent = otpText;
    sessionStorage.setItem("registerData", JSON.stringify({
      name,
      moNumber,
      city: cityValue,
      pgName,
      address,
      imageName: uploadedImageName
    }));
    setTimeout(() => window.location.href = "verifyOtp.html", 1000);
  } else {
    message.style.color = "red";
    message.textContent = otpText;
  }
});
