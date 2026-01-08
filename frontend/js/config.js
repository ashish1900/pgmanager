// config.js

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "https://pgmanagerbackend.onrender.com"
    : "https://pgmanagerbackend.onrender.com";

const originalFetch = window.fetch;

// fetch override
window.fetch = function (url, options = {}) {

  if (typeof url === "string" && url.startsWith("/")) {
    url = API_BASE_URL + url;
  }

  if (typeof url === "string" && url.startsWith("https://pgmanagerbackend.onrender.com")) {
    url = url.replace("https://pgmanagerbackend.onrender.com", API_BASE_URL);
  }

  return originalFetch(url, options);
};
