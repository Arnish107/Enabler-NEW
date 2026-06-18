window.EnablerToast = (function () {
  var container = null;

  function ensureContainer() {
    if (!container) {
      container = document.getElementById("toast-container");
    }
    return container;
  }

  function show(type, title, message, duration) {
    var el = ensureContainer();
    if (!el) return;

    var icons = {
      success: "✓",
      error: "✕",
      info: "ℹ",
      warning: "⚠",
    };

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.innerHTML =
      '<span class="toast-icon" aria-hidden="true">' +
      (icons[type] || icons.info) +
      "</span>" +
      '<div class="toast-body"><strong>' +
      title +
      "</strong>" +
      (message ? "<p>" + message + "</p>" : "") +
      "</div>" +
      '<button class="toast-close" aria-label="Dismiss">&times;</button>';

    var closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", function () {
      toast.remove();
    });

    el.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, duration || 4000);
  }

  return {
    success: function (title, msg) {
      show("success", title, msg);
    },
    error: function (title, msg) {
      show("error", title, msg);
    },
    info: function (title, msg) {
      show("info", title, msg);
    },
    warning: function (title, msg) {
      show("warning", title, msg);
    },
  };
})();
