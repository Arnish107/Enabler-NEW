window.EnablerViews = window.EnablerViews || {};

EnablerViews.live = {
  render: function () {
    var messages = EnablerState.get("liveMessages") || [];
    return (
      '<div class="page-header">' +
      '<h1 class="page-title">Live Conversation</h1>' +
      '<p class="page-desc">Real-time split-screen communication. Messages are translated through the backend translation API.</p>' +
      "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;align-items:center">' +
      '<div class="form-group" style="margin:0;min-width:200px">' +
      '<label class="form-label" for="lang-select">Language</label>' +
      '<select class="form-select" id="lang-select">' +
      '<option value="en-asl">English → ASL</option>' +
      '<option value="en-es">English → Spanish</option>' +
      '<option value="en-fr">English → French</option>' +
      "</select></div>" +
      '<span class="badge badge-success" id="live-status">● Connected</span>' +
      '<button class="btn btn-ghost btn-sm" id="clear-chat" type="button">Clear history</button>' +
      "</div>" +
      '<div class="chat-split">' +
      '<div class="chat-panel">' +
      '<div class="chat-panel-header"><span>🗣️ Speaker A</span><span class="badge">Speech</span></div>' +
      '<div class="chat-messages" id="chat-left">' +
      renderMessages(messages.filter(function (m) { return m.side === "left"; })) +
      "</div>" +
      '<div class="chat-input-row">' +
      '<input class="form-input" id="input-left" type="text" placeholder="Type a message..." aria-label="Speaker A message" />' +
      '<button class="btn btn-primary btn-sm" id="send-left" type="button">Send</button>' +
      "</div></div>" +
      '<div class="chat-panel">' +
      '<div class="chat-panel-header"><span>🤟 Speaker B</span><span class="badge">Sign → Text</span></div>' +
      '<div class="chat-messages" id="chat-right">' +
      renderMessages(messages.filter(function (m) { return m.side === "right"; })) +
      "</div>" +
      '<div class="chat-input-row">' +
      '<input class="form-input" id="input-right" type="text" placeholder="Type sign translation..." aria-label="Speaker B message" />' +
      '<button class="btn btn-primary btn-sm" id="send-right" type="button">Send</button>' +
      "</div></div></div>"
    );
  },

  init: function (root) {
    var langMap = {
      "en-asl": { direction: "speech-to-sign", source: "en", target: "asl", label: "ASL" },
      "en-es": { direction: "text-to-text", source: "en", target: "es", label: "Spanish" },
      "en-fr": { direction: "text-to-text", source: "en", target: "fr", label: "French" },
    };

    function sendMessage(side, text) {
      if (!text.trim()) return;

      var lang = root.querySelector("#lang-select").value;
      var config = langMap[lang] || langMap["en-asl"];
      var allMessages = EnablerState.get("liveMessages") || [];

      allMessages.push({
        side: side,
        text: text.trim(),
        time: new Date().toISOString(),
        translated: false,
      });

      var container = root.querySelector(side === "left" ? "#chat-left" : "#chat-right");
      appendBubble(container, text.trim(), "sent");
      EnablerState.set("liveMessages", allMessages);

      var replySide = side === "left" ? "right" : "left";
      var replyContainer = root.querySelector(replySide === "left" ? "#chat-left" : "#chat-right");
      appendBubble(replyContainer, "Processing…", "received processing");

      EnablerAPI.translate(text.trim(), config.direction, config.source, config.target, {
        enhance: config.direction === "text-to-text",
      })
        .then(function (result) {
          var bubbles = replyContainer.querySelectorAll(".chat-bubble.processing");
          bubbles.forEach(function (b) { b.remove(); });

          var reply =
            config.direction === "speech-to-sign"
              ? result.translatedText
              : result.translatedText;

          appendBubble(replyContainer, reply, "received");

          allMessages = EnablerState.get("liveMessages") || [];
          allMessages.push({
            side: replySide,
            text: reply,
            confidence: result.confidence,
            time: new Date().toISOString(),
            translated: true,
          });
          EnablerState.set("liveMessages", allMessages);
          EnablerToast.info(
            "Translation complete",
            Math.round(result.confidence * 100) + "% confidence · " + config.label,
          );
        })
        .catch(function (err) {
          var bubbles = replyContainer.querySelectorAll(".chat-bubble.processing");
          bubbles.forEach(function (b) { b.remove(); });
          EnablerToast.error("Translation failed", err.message);
        });
    }

    root.querySelector("#send-left").addEventListener("click", function () {
      sendMessage("left", root.querySelector("#input-left").value);
      root.querySelector("#input-left").value = "";
    });

    root.querySelector("#send-right").addEventListener("click", function () {
      sendMessage("right", root.querySelector("#input-right").value);
      root.querySelector("#input-right").value = "";
    });

    ["#input-left", "#input-right"].forEach(function (sel) {
      root.querySelector(sel).addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          root.querySelector(sel === "#input-left" ? "#send-left" : "#send-right").click();
        }
      });
    });

    root.querySelector("#clear-chat").addEventListener("click", function () {
      EnablerState.set("liveMessages", []);
      root.querySelector("#chat-left").innerHTML = emptyChat();
      root.querySelector("#chat-right").innerHTML = emptyChat();
      EnablerToast.info("Chat cleared");
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
        (m.confidence ? '<br><small style="opacity:0.7">' + Math.round(m.confidence * 100) + "% confidence</small>" : "") +
        "</div>"
      );
    })
    .join("");
}

function appendBubble(container, text, type) {
  if (container.querySelector(".empty-state")) container.innerHTML = "";
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
