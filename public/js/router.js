window.EnablerRouter = (function () {
  var routes = {};
  var currentRoute = null;
  var onRouteChange = null;

  var sidebarLinks = [
    { path: "speech-sign", label: "Speech → Sign", icon: "🎤" },
    { path: "sign-text", label: "Sign → Text", icon: "🤟" },
    { path: "live", label: "Live Conversation", icon: "💬" },
    { path: "video", label: "Video Translation", icon: "🎬" },
    { path: "emergency", label: "Emergency", icon: "🚨" },
    { path: "alerts", label: "Sound Alerts", icon: "🔔" },
  ];

  function register(name, handler) {
    routes[name] = handler;
  }

  function getPath() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    return hash || "home";
  }

  function navigate(path) {
    window.location.hash = path === "home" ? "" : "#/" + path;
  }

  function renderSidebar(activePath) {
    var isApp = activePath !== "home";
    var sidebar = document.getElementById("app-sidebar");
    var main = document.getElementById("app-main");

    if (!sidebar || !main) return;

    if (isApp) {
      sidebar.classList.add("is-visible");
      main.classList.add("with-sidebar");
    } else {
      sidebar.classList.remove("is-visible");
      main.classList.remove("with-sidebar");
    }

    var nav = sidebar.querySelector(".sidebar-nav");
    if (!nav) return;

    nav.innerHTML = sidebarLinks
      .map(function (link) {
        return (
          '<li><a href="#/' +
          link.path +
          '" class="sidebar-link' +
          (activePath === link.path ? " active" : "") +
          '" data-route="' +
          link.path +
          '">' +
          '<span class="sidebar-icon" aria-hidden="true">' +
          link.icon +
          "</span>" +
          link.label +
          "</a></li>"
        );
      })
      .join("");
  }

  function updateNavActive(path) {
    document.querySelectorAll("[data-route]").forEach(function (el) {
      var route = el.getAttribute("data-route");
      el.classList.toggle("active", route === path);
    });
  }

  function handleRoute() {
    var path = getPath();
    if (path === currentRoute) return;
    currentRoute = path;

    var handler = routes[path] || routes.home;
    var main = document.getElementById("app-main");

    if (main && handler) {
      main.innerHTML = handler.render ? handler.render() : "";
      if (handler.init) handler.init(main);
    }

    renderSidebar(path);
    updateNavActive(path);

    document.title =
      path === "home"
        ? "Enabler — AI Accessibility Tools"
        : "Enabler — " + formatTitle(path);

    if (onRouteChange) onRouteChange(path);

    main && main.focus();
  }

  function formatTitle(path) {
    var map = {
      "speech-sign": "Speech to Sign",
      "sign-text": "Sign to Text",
      live: "Live Conversation",
      video: "Video Translation",
      emergency: "Emergency Communication",
      alerts: "Sound Alerts",
    };
    return map[path] || path;
  }

  function start() {
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  return {
    register: register,
    navigate: navigate,
    start: start,
    getPath: getPath,
    onRouteChange: function (fn) {
      onRouteChange = fn;
    },
  };
})();
