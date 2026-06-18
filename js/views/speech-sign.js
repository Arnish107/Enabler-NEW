window.EnablerViews = window.EnablerViews || {};

EnablerViews["speech-sign"] = {
  render: function () {
    var history = EnablerState.get("speechHistory") || [];
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Speech → Sign</h1>" +
      '<p class="page-desc">Speak into your microphone and watch real-time sign language translation. History is saved locally.</p>' +
      "</div>" +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Input</h2><span class="badge" id="speech-status">Ready</span></div>' +
      '<div class="card-body" style="text-align:center">' +
      '<button class="mic-btn" id="mic-btn" aria-label="Start recording" type="button">🎤</button>' +
      '<p style="margin:1rem 0 0;color:var(--text-muted);font-size:0.875rem" id="mic-hint">Click to start speaking</p>' +
      '<div class="form-group" style="margin-top:1.5rem;text-align:left">' +
      '<label class="form-label" for="transcript">Transcript</label>' +
      '<textarea class="form-textarea" id="transcript" rows="4" placeholder="Your speech will appear here..." readonly></textarea>' +
      "</div></div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Sign Output</h2></div>' +
      '<div class="card-body">' +
      '<div class="sign-avatar" id="sign-output">' +
      '<span class="sign-figure" id="sign-figure" aria-hidden="true">🤟</span>' +
      '<span class="sign-label" id="sign-word">Waiting for input</span>' +
      "</div></div></div>" +
      '<div class="card" style="grid-column:1/-1"><div class="card-header"><h2 class="card-title">Translation History</h2>' +
      '<button class="btn btn-ghost btn-sm" id="clear-history" type="button">Clear</button></div>' +
      '<div class="card-body" id="history-container">' +
      renderHistory(history) +
      "</div></div></div>"
    );
  },

  init: function (root) {
    var isRecording = false;
    var micBtn = root.querySelector("#mic-btn");
    var transcript = root.querySelector("#transcript");
    var signWord = root.querySelector("#sign-word");
    var signFigure = root.querySelector("#sign-figure");
    var status = root.querySelector("#speech-status");
    var micHint = root.querySelector("#mic-hint");
    var interval = null;

    var mockPhrases = [
      "Hello, how are you today?",
      "I would like to order a coffee please.",
      "Thank you for your help.",
      "Where is the nearest hospital?",
      "Nice to meet you.",
    ];

    var signEmojis = ["👋", "🤟", "✋", "👍", "🙏", "💪", "👏", "🤲"];

    micBtn.addEventListener("click", function () {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    function startRecording() {
      isRecording = true;
      micBtn.classList.add("recording");
      micBtn.setAttribute("aria-label", "Stop recording");
      status.textContent = "Listening...";
      status.className = "badge badge-warning";
      micHint.textContent = "Listening... click to stop";
      transcript.value = "";
      signWord.textContent = "Processing...";

      var phraseIdx = 0;
      var charIdx = 0;
      var phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];

      interval = setInterval(function () {
        if (charIdx < phrase.length) {
          transcript.value += phrase[charIdx];
          charIdx++;
          signFigure.textContent =
            signEmojis[charIdx % signEmojis.length];
          signWord.textContent = phrase.split(" ")[Math.min(Math.floor(charIdx / 5), phrase.split(" ").length - 1)] || "...";
        }
      }, 80);

      EnablerToast.info("Microphone active", "Simulated speech recognition started.");
    }

    function stopRecording() {
      isRecording = false;
      clearInterval(interval);
      micBtn.classList.remove("recording");
      micBtn.setAttribute("aria-label", "Start recording");
      status.textContent = "Complete";
      status.className = "badge badge-success";
      micHint.textContent = "Click to start speaking";

      var text = transcript.value || "Hello, how are you?";
      transcript.value = text;
      signWord.textContent = text.split(" ").slice(-1)[0];
      signFigure.textContent = "🤟";

      EnablerState.push("speechHistory", {
        text: text,
        time: new Date().toISOString(),
      });

      updateHistory(root);
      EnablerToast.success("Translation complete", "Sign output updated.");
    }

    root.querySelector("#clear-history").addEventListener("click", function () {
      EnablerState.set("speechHistory", []);
      updateHistory(root);
      EnablerToast.info("History cleared");
    });
  },
};

function renderHistory(history) {
  if (!history.length) {
    return '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>No translations yet</h3><p>Start speaking to build your history.</p></div>';
  }
  return (
    '<ul class="history-list">' +
    history
      .map(function (item) {
        return (
          '<li class="history-item"><time>' +
          new Date(item.time).toLocaleString() +
          "</time><p>" +
          escapeHtml(item.text) +
          "</p></li>"
        );
      })
      .join("") +
    "</ul>"
  );
}

function updateHistory(root) {
  var container = root.querySelector("#history-container");
  if (container) {
    container.innerHTML = renderHistory(EnablerState.get("speechHistory") || []);
  }
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
