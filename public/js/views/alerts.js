window.EnablerViews = window.EnablerViews || {};

EnablerViews.alerts = {
  render: function () {
    var alerts = EnablerState.get("soundAlerts") || {};
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Sound Alerts</h1>" +
      '<p class="page-desc">Configure visual, haptic, and notification alerts for important environmental sounds.</p>' +
      "</div>" +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Alert Settings</h2>' +
      '<span class="badge badge-success" id="alerts-active">Monitoring</span></div>' +
      '<div class="card-body">' +
      alertToggle("doorbell", "🔔", "Doorbell", "Get notified when someone rings the doorbell.", alerts.doorbell) +
      alertToggle("fireAlarm", "🔥", "Fire Alarm", "Critical alert for fire and smoke alarms.", alerts.fireAlarm) +
      alertToggle("babyCrying", "👶", "Baby Crying", "Detect crying sounds from infants.", alerts.babyCrying) +
      alertToggle("phoneRinging", "📱", "Phone Ringing", "Alert when your phone is ringing nearby.", alerts.phoneRinging) +
      alertToggle("carHorn", "🚗", "Car Horn", "Detect car horns and traffic warnings.", alerts.carHorn) +
      "</div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Recent Alerts</h2></div>' +
      '<div class="card-body" id="alert-log">' +
      '<div class="empty-state" id="alert-empty"><div class="empty-state-icon">🔕</div><h3>No alerts yet</h3><p>Enable alerts and simulate detection below.</p></div>' +
      '<ul class="history-list" id="alert-list" hidden></ul>' +
      "</div>" +
      '<div class="card-body" style="border-top:1px solid var(--border)">' +
      '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--text-secondary)">Simulate sound detection:</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem">' +
      '<button class="btn btn-secondary btn-sm" data-sim="doorbell" type="button">Test Doorbell</button>' +
      '<button class="btn btn-secondary btn-sm" data-sim="fireAlarm" type="button">Test Fire Alarm</button>' +
      '<button class="btn btn-secondary btn-sm" data-sim="phoneRinging" type="button">Test Phone</button>' +
      "</div></div></div></div>"
    );
  },

  init: function (root) {
    var alertLog = [];

    root.querySelectorAll(".alert-toggle input").forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.getAttribute("data-key");
        var alerts = EnablerState.get("soundAlerts") || {};
        alerts[key] = input.checked;
        EnablerState.set("soundAlerts", alerts);

        EnablerToast.info(
          input.checked ? "Alert enabled" : "Alert disabled",
          formatAlertName(key)
        );
      });
    });

    root.querySelectorAll("[data-sim]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-sim");
        var alerts = EnablerState.get("soundAlerts") || {};

        if (!alerts[key]) {
          EnablerToast.warning("Alert disabled", "Enable " + formatAlertName(key) + " first.");
          return;
        }

        triggerAlert(root, key, alertLog);
      });
    });
  },
};

function alertToggle(key, icon, title, desc, enabled) {
  return (
    '<div class="alert-card">' +
    '<div class="alert-card-icon" aria-hidden="true">' +
    icon +
    "</div>" +
    '<div class="alert-card-body toggle-row" style="padding:0;border:none">' +
    '<div class="toggle-info"><h4>' +
    title +
    "</h4><p>" +
    desc +
    '</p></div><label class="toggle alert-toggle">' +
    '<input type="checkbox" data-key="' +
    key +
    '"' +
    (enabled ? " checked" : "") +
    ' aria-label="Toggle ' +
    title +
    '" /><span class="toggle-slider"></span></label></div></div>'
  );
}

function formatAlertName(key) {
  var names = {
    doorbell: "Doorbell",
    fireAlarm: "Fire Alarm",
    babyCrying: "Baby Crying",
    phoneRinging: "Phone Ringing",
    carHorn: "Car Horn",
  };
  return names[key] || key;
}

function triggerAlert(root, key, alertLog) {
  var icons = {
    doorbell: "🔔",
    fireAlarm: "🔥",
    babyCrying: "👶",
    phoneRinging: "📱",
    carHorn: "🚗",
  };

  var isCritical = key === "fireAlarm";

  alertLog.unshift({
    key: key,
    time: new Date().toISOString(),
  });

  var empty = root.querySelector("#alert-empty");
  var list = root.querySelector("#alert-list");
  empty.hidden = true;
  list.hidden = false;

  list.innerHTML = alertLog
    .slice(0, 10)
    .map(function (a) {
      return (
        '<li class="history-item"><time>' +
        new Date(a.time).toLocaleString() +
        "</time><p>" +
        icons[a.key] +
        " " +
        formatAlertName(a.key) +
        " detected</p></li>"
      );
    })
    .join("");

  if (navigator.vibrate) {
    navigator.vibrate(isCritical ? [300, 100, 300, 100, 300] : 200);
  }

  if (isCritical) {
    EnablerToast.error("Fire alarm detected!", "Visual and haptic alert triggered.");
  } else {
    EnablerToast.warning(
      formatAlertName(key) + " detected",
      "Visual notification displayed."
    );
  }

  flashScreen(isCritical);
}

function flashScreen(critical) {
  var flash = document.createElement("div");
  flash.style.cssText =
    "position:fixed;inset:0;z-index:9997;pointer-events:none;background:" +
    (critical ? "rgba(239,68,68,0.3)" : "rgba(75,77,255,0.2)") +
    ";animation:fade-in 0.3s ease";
  document.body.appendChild(flash);
  setTimeout(function () {
    flash.remove();
  }, 600);
}
