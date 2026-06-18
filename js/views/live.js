window.EnablerViews = window.EnablerViews || {};

EnablerViews.live = {
  render: function () {
    var messages = EnablerState.get("liveMessages") || [];
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Live Conversation</h1>" +
      '<p class="page-desc">Real-time split-screen communication with automatic translation between speech and sign language.</p>' +
      "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;align-items:center">' +
      '<div class="form-group" style="margin:0;min-width:200px">' +
      '<label class="form-label" for="lang-select">Language</label>' +
      '<select class="form-select" id="lang-select">' +
      '<option value="en-asl">English → ASL</option>' +
      '<option value="en-bsl">English → BSL</option>' +
      '<option value="es-asl">Spanish → ASL</option>' +
      '<option value="fr-lsf">French → LSF</option>' +
      "</select></div>" +
      '<span class="badge badge-success" id="live-status">● Connected</span>' +
      '<button class="btn btn-ghost btn-sm" id="clear-chat" type="button">Clear history</button>' +
      "</div>" +
      '<div class="chat-split">' +
      '<div class="chat-panel">' +
      '<div class="chat-panel-header"><span>🗣️ Speaker A</span><span class="badge">Speech</span></div>' +
      '<div class="chat-messages" id="chat-left">' +
      renderMessages(messages.filter(function (m) {
        return m.side === "left";
      })) +
      "</div>" +
      '<div class="chat-input-row">' +
      '<input class="form-input" id="input-left" type="text" placeholder="Type a message..." aria-label="Speaker A message" />' +
      '<button class="btn btn-primary btn-sm" id="send-left" type="button">Send</button>' +
      "</div></div>" +
      '<div class="chat-panel">' +
      '<div class="chat-panel-header"><span>🤟 Speaker B</span><span class="badge">Sign → Text</span></div>' +
      '<div class="chat-messages" id="chat-right">' +
      renderMessages(messages.filter(function (m) {
        return m.side === "right";
      })) +
      "</div>" +
      '<div class="chat-input-row">' +
      '<input class="form-input" id="input-right" type="text" placeholder="Type sign translation..." aria-label="Speaker B message" />' +
      '<button class="btn btn-primary btn-sm" id="send-right" type="button">Send</button>' +
      "</div></div></div>"
    );
  },

  init: function (root) {
    var translations = {
      "en-asl": { left: "→ ASL", right: "→ English" },
      "en-bsl": { left: "→ BSL", right: "→ English" },
      "es-asl": { left: "→ ASL", right: "→ Spanish" },
      "fr-lsf": { left: "→ LSF", right: "→ French" },
    };

    var mockReplies = [
      "Nice to meet you!",
      "I understand, thank you.",
      "Could you repeat that?",
      "That makes sense.",
      "Let me sign that back to you.",
    ];

    function sendMessage(side, text) {
      if (!text.trim()) return;

      var lang = root.querySelector("#lang-select").value;
      var allMessages = EnablerState.get("liveMessages") || [];

      allMessages.push({
        side: side,
        text: text.trim(),
        time: new Date().toISOString(),
        translated: false,
      });

      var container = root.querySelector(
        side === "left" ? "#chat-left" : "#chat-right"
      );
      appendBubble(container, text.trim(), "sent");

      EnablerState.set("liveMessages", allMessages);

      setTimeout(function () {
        var replySide = side === "left" ? "right" : "left";
        var replyContainer = root.querySelector(
          replySide === "left" ? "#chat-left" : "#chat-right"
        );
        var reply =
          mockReplies[Math.floor(Math.random() * mockReplies.length)] +
          " " +
          (translations[lang]
            ? translations[lang][replySide === "left" ? "left" : "right"]
            : "");

        appendBubble(replyContainer, reply, "received");

        allMessages = EnablerState.get("liveMessages") || [];
        allMessages.push({
          side: replySide,
          text: reply,
          time: new Date().toISOString(),
          translated: true,
        });
        EnablerState.set("liveMessages", allMessages);
        EnablerToast.info("Translation received", "Real-time mock translation delivered.");
      }, 1200);
    }

    root.querySelector("#send-left").addEventListener("click", function () {
      var input = root.querySelector("#input-left");
      sendMessage("left", input.value);
      input.value = "";
    });

    root.querySelector("#send-right").addEventListener("click", function () {
      var input = root.querySelector("#input-right");
      sendMessage("right", input.value);
      input.value = "";
    });

    ["#input-left", "#input-right"].forEach(function (sel) {
      root.querySelector(sel).addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (sel === "#input-left") {
            root.querySelector("#send-left").click();
          } else {
            root.querySelector("#send-right").click();
          }
        }
      });
    });

    root.querySelector("#clear-chat").addEventListener("click", function () {
      EnablerState.set("liveMessages", []);
      root.querySelector("#chat-left").innerHTML = emptyChat();
      root.querySelector("#chat-right").innerHTML = emptyChat();
      EnablerToast.info("Chat cleared");
    });

    root.querySelector("#lang-select").addEventListener("change", function () {
      EnablerToast.info("Language updated", "Translation direction changed.");
    });
  },
};

function renderMessages(messages) {
  if (!messages.length) return emptyChat();
  return messages
    .map(function (m) {
      return (
        '<div class="chat-bubble ' +
        (m.translated === false ? "sent" : "received") +
        '">' +
        escapeHtml(m.text) +
        "</div>"
      );
    })
    .join("");
}

function appendBubble(container, text, type) {
  if (container.querySelector(".empty-state")) {
    container.innerHTML = "";
  }
  var bubble = document.createElement("div");
  bubble.className = "chat-bubble " + type;
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function emptyChat() {
  return '<div class="empty-state" style="padding:2rem 1rem"><div class="empty-state-icon">💬</div><h3>No messages yet</h3><p>Start a conversation to see live translation.</p></div>';
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
