(function () {
  "use strict";

  function getLogoSrc() {
    var isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    return isDark ? "assets/logo-dark.svg" : "assets/logo-light.svg";
  }

  function updateLogos() {
    var src = getLogoSrc();
    document.querySelectorAll("[data-logo]").forEach(function (img) {
      img.src = src;
    });
  }

  function initTheme() {
    var saved = EnablerState.get("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeButton(saved);
    updateLogos();
  }

  function updateThemeButton(theme) {
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  function toggleTheme() {
    var current =
      document.documentElement.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    EnablerState.set("theme", next);
    updateThemeButton(next);
    updateLogos();
    EnablerToast.info(
      "Theme updated",
      next === "dark" ? "Dark mode enabled" : "Light mode enabled"
    );
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-center");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var sidebarToggle = document.getElementById("sidebar-toggle");
    var sidebar = document.getElementById("app-sidebar");
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", function () {
        sidebar.classList.toggle("is-visible");
      });
    }

    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }

    document.querySelectorAll(".nav-brand").forEach(function (brand) {
      brand.addEventListener("click", function (e) {
        e.preventDefault();
        EnablerRouter.navigate("home");
      });
    });
  }

  function registerRoutes() {
    EnablerRouter.register("home", EnablerViews.home);
    EnablerRouter.register("speech-sign", EnablerViews["speech-sign"]);
    EnablerRouter.register("sign-text", EnablerViews["sign-text"]);
    EnablerRouter.register("live", EnablerViews.live);
    EnablerRouter.register("video", EnablerViews.video);
    EnablerRouter.register("emergency", EnablerViews.emergency);
    EnablerRouter.register("alerts", EnablerViews.alerts);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    registerRoutes();
    EnablerRouter.start();

    EnablerAPI.health()
      .then(function (health) {
        if (health.capabilities && health.capabilities.openaiEnabled) {
          EnablerToast.info("AI backend ready", "OpenAI enhancement enabled.");
        }
      })
      .catch(function () {
        EnablerToast.warning("API offline", "Start the server with npm run dev.");
      });

    EnablerRouter.onRouteChange(function (path) {
      var sidebar = document.getElementById("app-sidebar");
      if (sidebar && window.innerWidth < 1024 && path !== "home") {
        sidebar.classList.remove("is-visible");
      }
    });
  });
})();
