window.EnablerViews = window.EnablerViews || {};

EnablerViews["speech-sign"] = {
  render: function () {
    var history = EnablerState.get("speechHistory") || [];
    return (
      '<div class="page-header">' +
      '<h1 class="page-title">Speech → Sign</h1>' +
      '<p class="page-desc">Speak into your microphone. Speech is converted to text via the Web Speech API, then mapped to sign language through the backend engine.</p>' +
      "</div>" +
      EnablerPipeline.createContainer("speech") +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Input</h2><span class="badge" id="speech-status">Ready</span></div>' +
      '<div class="card-body" style="text-align:center">' +
      '<button class="mic-btn" id="mic-btn" aria-label="Start recording" type="button">🎤</button>' +
      '<p style="margin:1rem 0 0;color:var(--text-muted);font-size:0.875rem" id="mic-hint">Click to start speaking</p>' +
      '<p style="margin:0.5rem 0 0;font-size:0.8125rem;color:var(--text-muted)" id="confidence-display"></p>' +
      '<div class="form-group" style="margin-top:1.5rem;text-align:left">' +
      '<label class="form-label" for="transcript">Transcript</label>' +
      '<textarea class="form-textarea" id="transcript" rows="4" placeholder="Your speech will appear here..." readonly></textarea>' +
      "</div></div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Sign Output</h2>' +
      '<span class="badge" id="sign-confidence"></span></div>' +
      '<div class="card-body">' +
      '<div class="sign-avatar" id="sign-output">' +
      '<span class="sign-figure" id="sign-figure" aria-hidden="true">🤟</span>' +
      '<span class="sign-label" id="sign-word">Waiting for input</span>' +
      "</div>" +
      '<div id="sign-sequence" style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:0.5rem"></div>' +
      "</div></div>" +
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
    var signSequence = root.querySelector("#sign-sequence");
    var status = root.querySelector("#speech-status");
    var micHint = root.querySelector("#mic-hint");
    var confidenceDisplay = root.querySelector("#confidence-display");
    var signConfidence = root.querySelector("#sign-confidence");
    var pipelineContainer = root.querySelector("#speech-pipeline");
    var pipelineStatus = root.querySelector("#speech-pipeline-status");
    var lastTranscript = "";

    if (!EnablerSpeechEngine.isSupported()) {
      micHint.textContent = "Web Speech API not supported. Type in the transcript field and press Convert below.";
      transcript.readOnly = false;
    }

    micBtn.addEventListener("click", function () {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    function startRecording() {
      if (!EnablerSpeechEngine.isSupported()) {
        EnablerToast.error("Not supported", "Use Chrome or Edge for speech recognition.");
        return;
      }

      isRecording = true;
      lastTranscript = "";
      micBtn.classList.add("recording");
      micBtn.setAttribute("aria-label", "Stop recording");
      status.textContent = "Listening";
      status.className = "badge badge-warning";
      micHint.textContent = "Listening… click to stop";
      transcript.value = "";
      signWord.textContent = "Listening…";

      EnablerPipeline.render(pipelineContainer, [
        { id: "1", label: "Capturing speech", status: "active" },
        { id: "2", label: "Speech-to-text (Web Speech API)", status: "pending" },
        { id: "3", label: "Backend transcript validation", status: "pending" },
        { id: "4", label: "Sign mapping engine", status: "pending" },
      ]);
      pipelineStatus.textContent = "Processing…";

      EnablerSpeechEngine.start(
        function (interim) {
          transcript.value = interim;
        },
        function (finalText, confidence) {
          lastTranscript = finalText;
          transcript.value = finalText;
          if (confidence) {
            confidenceDisplay.textContent =
              "Recognition confidence: " + Math.round(confidence * 100) + "%";
          }
        },
        function (err) {
          EnablerToast.error("Speech error", err.message);
          stopRecording();
        },
      );

      EnablerToast.info("Microphone active", "Speak clearly into your microphone.");
    }

    function stopRecording() {
      isRecording = false;
      EnablerSpeechEngine.stop();
      micBtn.classList.remove("recording");
      micBtn.setAttribute("aria-label", "Start recording");

      var text = lastTranscript || transcript.value.trim();
      if (!text) {
        status.textContent = "No speech";
        status.className = "badge";
        micHint.textContent = "No speech detected. Try again.";
        pipelineStatus.textContent = "Idle";
        return;
      }

      status.textContent = "Processing";
      status.className = "badge badge-warning";
      micHint.textContent = "Processing through backend…";
      signWord.textContent = "Processing…";

      EnablerPipeline.update(pipelineContainer, [
        { id: "1", label: "Capturing speech", status: "complete" },
        { id: "2", label: "Speech-to-text (Web Speech API)", status: "complete", detail: text.length + " chars" },
        { id: "3", label: "Backend transcript validation", status: "active" },
        { id: "4", label: "Sign mapping engine", status: "pending" },
      ]);

      EnablerAPI.speechToText(text, "en-US")
        .then(function (sttResult) {
          transcript.value = sttResult.transcript;
          confidenceDisplay.textContent =
            "STT confidence: " + Math.round(sttResult.confidence * 100) + "%";

          EnablerPipeline.update(pipelineContainer, [
            { id: "1", label: "Capturing speech", status: "complete" },
            { id: "2", label: "Speech-to-text", status: "complete", detail: sttResult.source },
            { id: "3", label: "Backend validation", status: "complete", detail: Math.round(sttResult.confidence * 100) + "% confidence" },
            { id: "4", label: "Sign mapping engine", status: "active" },
          ]);

          return EnablerAPI.translate(sttResult.transcript, "speech-to-sign");
        })
        .then(function (translateResult) {
          renderSignOutput(translateResult);
          status.textContent = "Complete";
          status.className = "badge badge-success";
          micHint.textContent = "Click to start speaking";
          pipelineStatus.textContent = "Complete";
          pipelineStatus.className = "badge badge-success";

          EnablerPipeline.update(pipelineContainer, translateResult.pipeline.map(function (s, i) {
            return { id: String(i), label: s.label, status: s.status, detail: s.detail };
          }));

          EnablerState.push("speechHistory", {
            text: translateResult.originalText,
            signs: translateResult.translatedText,
            confidence: translateResult.confidence,
            time: new Date().toISOString(),
          });
          updateHistory(root);
          EnablerToast.success("Translation complete", "Sign sequence generated.");
        })
        .catch(function (err) {
          status.textContent = "Error";
          status.className = "badge";
          micHint.textContent = "Processing failed. Try again.";
          pipelineStatus.textContent = "Error";
          EnablerToast.error("Processing failed", err.message);
        });
    }

    function renderSignOutput(result) {
      var sequence = result.signSequence || [];
      if (!sequence.length) {
        signWord.textContent = "No signs mapped";
        return;
      }

      signWord.textContent = sequence[0].label;
      signFigure.textContent = sequence[0].emoji;
      signConfidence.textContent = Math.round(result.confidence * 100) + "% confidence";
      signConfidence.className = "badge badge-success";

      signSequence.innerHTML = sequence
        .map(function (s) {
          return (
            '<span class="badge" title="' +
            s.gesture +
            '">' +
            s.emoji +
            " " +
            s.label +
            "</span>"
          );
        })
        .join("");
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
          (item.signs ? '<br><small style="color:var(--text-muted)">' + escapeHtml(item.signs) + "</small>" : "") +
          (item.confidence ? '<br><small>Confidence: ' + Math.round(item.confidence * 100) + "%</small>" : "") +
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
