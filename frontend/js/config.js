// config.js

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "http://localhost:8080";

const originalFetch = window.fetch;

// fetch override
window.fetch = function (url, options = {}) {

  if (typeof url === "string" && url.startsWith("/")) {
    url = API_BASE_URL + url;
  }

  if (typeof url === "string" && url.startsWith("http://localhost:8080")) {
    url = url.replace("http://localhost:8080", API_BASE_URL);
  }

  return originalFetch(url, options);
};
