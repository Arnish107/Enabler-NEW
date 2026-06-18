window.EnablerUIStates = (function () {
  "use strict";

  function setBadge(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "badge" + (type ? " badge-" + type : "");
  }

  function setProcessing(el, message) {
    setBadge(el, message || "Processing…", "warning");
  }

  function setSuccess(el, message) {
    setBadge(el, message || "Complete", "success");
  }

  function setError(el, message) {
    setBadge(el, message || "Error", "");
  }

  function setReady(el) {
    setBadge(el, "Ready", "");
  }

  function showLoadingOverlay(container, message) {
    if (!container) return null;
    var existing = container.querySelector(".loading-overlay");
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML =
      '<div style="text-align:center">' +
      '<div class="spinner" style="margin:0 auto 0.75rem"></div>' +
      '<p style="margin:0;font-size:0.875rem;font-weight:600">' +
      (message || "Processing…") +
      "</p></div>";
    container.style.position = "relative";
    container.appendChild(overlay);
    return overlay;
  }

  function hideLoadingOverlay(container) {
    if (!container) return;
    var overlay = container.querySelector(".loading-overlay");
    if (overlay) overlay.remove();
  }

  function handleApiError(err, statusEl) {
    var message = err && err.message ? err.message : "Request failed";
    setError(statusEl, "Error");
    EnablerToast.error("API Error", message);
    return message;
  }

  return {
    setBadge: setBadge,
    setProcessing: setProcessing,
    setSuccess: setSuccess,
    setError: setError,
    setReady: setReady,
    showLoadingOverlay: showLoadingOverlay,
    hideLoadingOverlay: hideLoadingOverlay,
    handleApiError: handleApiError,
  };
})();
