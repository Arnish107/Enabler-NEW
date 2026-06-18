window.EnablerViews = window.EnablerViews || {};

EnablerViews.emergency = {
  render: function () {
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Emergency Communication</h1>" +
      '<p class="page-desc">Tap a card to instantly display critical messages. Designed for high-stress, high-accessibility situations.</p>' +
      "</div>" +
      '<div class="emergency-grid" id="emergency-grid">' +
      emergencyCard("deaf", "🧏", "I am deaf.", "Tap to display this message on screen.") +
      emergencyCard("type", "⌨️", "Please type your response.", "Request written communication.") +
      emergencyCard("medical", "🏥", "I need medical assistance.", "Alert others to a medical emergency.") +
      emergencyCard("call", "📞", "Call emergency services.", "Request immediate emergency help.") +
      "</div>" +
      '<div class="card" style="margin-top:1.5rem" id="display-card" hidden>' +
      '<div class="card-body" style="text-align:center;padding:3rem 2rem">' +
      '<p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Active Message</p>' +
      '<h2 id="display-message" style="margin:0;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;line-height:1.3"></h2>' +
      '<p id="display-sub" style="margin:1rem 0 0;color:var(--text-secondary)"></p>' +
      '<div style="margin-top:2rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="btn-fullscreen" type="button">Show Fullscreen</button>' +
      '<button class="btn btn-secondary" id="btn-copy" type="button">Copy Message</button>' +
      '<button class="btn btn-ghost" id="btn-dismiss" type="button">Dismiss</button>' +
      "</div></div></div>"
    );
  },

  init: function (root) {
    var displayCard = root.querySelector("#display-card");
    var displayMessage = root.querySelector("#display-message");
    var displaySub = root.querySelector("#display-sub");
    var activeCard = null;

    var messages = {
      deaf: {
        text: "I am deaf.",
        sub: "Please face me and speak clearly, or write your message.",
      },
      type: {
        text: "Please type your response.",
        sub: "I communicate best through written text.",
      },
      medical: {
        text: "I need medical assistance.",
        sub: "Please call emergency services immediately.",
      },
      call: {
        text: "Call emergency services.",
        sub: "This is an emergency. Dial 911 or your local emergency number.",
      },
    };

    root.querySelectorAll(".emergency-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-id");
        var msg = messages[id];
        if (!msg) return;

        if (activeCard) activeCard.classList.remove("active");
        card.classList.add("active");
        activeCard = card;

        displayMessage.textContent = msg.text;
        displaySub.textContent = msg.sub;
        displayCard.hidden = false;
        displayCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (navigator.vibrate) navigator.vibrate(200);
        EnablerToast.warning("Emergency message active", msg.text);

        if (id === "call" || id === "medical") {
          setTimeout(function () {
            EnablerToast.info(
              "Emergency alert",
              "In a real deployment, this would notify emergency contacts."
            );
          }, 1500);
        }
      });
    });

    root.querySelector("#btn-fullscreen").addEventListener("click", function () {
      var overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:9998;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;cursor:pointer";
      overlay.innerHTML =
        '<div><h1 style="font-size:clamp(2rem,8vw,4rem);margin:0 0 1rem;font-weight:800">' +
        displayMessage.textContent +
        '</h1><p style="font-size:1.25rem;opacity:0.9;margin:0">' +
        displaySub.textContent +
        '</p><p style="margin-top:2rem;font-size:0.875rem;opacity:0.7">Tap anywhere to close</p></div>';
      overlay.addEventListener("click", function () {
        overlay.remove();
      });
      document.body.appendChild(overlay);
    });

    root.querySelector("#btn-copy").addEventListener("click", function () {
      navigator.clipboard
        .writeText(displayMessage.textContent + " " + displaySub.textContent)
        .then(function () {
          EnablerToast.success("Copied", "Message copied to clipboard.");
        })
        .catch(function () {
          EnablerToast.error("Copy failed", "Could not copy to clipboard.");
        });
    });

    root.querySelector("#btn-dismiss").addEventListener("click", function () {
      displayCard.hidden = true;
      if (activeCard) {
        activeCard.classList.remove("active");
        activeCard = null;
      }
    });
  },
};

function emergencyCard(id, icon, title, desc) {
  return (
    '<button class="emergency-card" type="button" data-id="' +
    id +
    '">' +
    '<div class="emergency-card-icon" aria-hidden="true">' +
    icon +
    "</div>" +
    "<h3>" +
    title +
    "</h3><p>" +
    desc +
    "</p></button>"
  );
}
