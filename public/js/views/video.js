window.EnablerViews = window.EnablerViews || {};

EnablerViews.video = {
  render: function () {
    return (
      '<div class="page-header">' +
      '<h1 class="page-title">Video Translation</h1>' +
      '<p class="page-desc">Upload MP4/MOV files. Hand landmarks are extracted and processed through the sign-to-text pipeline.</p>' +
      "</div>" +
      EnablerPipeline.createContainer("video") +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Upload Video</h2></div>' +
      '<div class="card-body">' +
      '<div class="upload-zone" id="video-upload">' +
      '<input type="file" id="video-file" accept="video/mp4,video/quicktime,.mp4,.mov" hidden />' +
      '<div class="upload-zone-icon">🎬</div>' +
      "<h3>Drop your video here</h3>" +
      "<p>Supports MP4 and MOV files</p>" +
      "</div>" +
      '<div id="upload-progress" hidden style="margin-top:1.5rem">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">' +
      '<span style="font-size:0.875rem;font-weight:600" id="progress-label">Processing frames…</span>' +
      '<span style="font-size:0.875rem;color:var(--text-muted)" id="progress-pct">0%</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>' +
      "</div>" +
      '<div id="video-info" hidden style="margin-top:1rem;padding:1rem;background:var(--bg-subtle);border-radius:var(--radius)">' +
      '<p style="margin:0;font-size:0.875rem" id="video-info-text"></p></div>' +
      "</div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Transcript Output</h2>' +
      '<span class="badge" id="video-status">Waiting</span></div>' +
      '<div class="card-body" id="transcript-panel">' +
      '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--text-muted)" id="video-confidence"></p>' +
      '<div class="empty-state" id="transcript-empty">' +
      '<div class="empty-state-icon">📄</div><h3>No transcript yet</h3><p>Upload a video to begin translation.</p></div>' +
      '<textarea class="form-textarea" id="video-transcript" rows="12" hidden readonly></textarea>' +
      '<div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap" id="export-actions" hidden>' +
      '<button class="btn btn-primary btn-sm" id="btn-save" type="button">Save Transcript</button>' +
      '<button class="btn btn-secondary btn-sm" id="btn-export-txt" type="button">Export .txt</button>' +
      '<button class="btn btn-secondary btn-sm" id="btn-export-srt" type="button">Export .srt</button>' +
      "</div></div></div></div>"
    );
  },

  init: function (root) {
    var uploadZone = root.querySelector("#video-upload");
    var fileInput = root.querySelector("#video-file");
    var progressWrap = root.querySelector("#upload-progress");
    var progressFill = root.querySelector("#progress-fill");
    var progressPct = root.querySelector("#progress-pct");
    var progressLabel = root.querySelector("#progress-label");
    var videoInfo = root.querySelector("#video-info");
    var videoInfoText = root.querySelector("#video-info-text");
    var videoStatus = root.querySelector("#video-status");
    var videoConfidence = root.querySelector("#video-confidence");
    var transcriptEmpty = root.querySelector("#transcript-empty");
    var transcript = root.querySelector("#video-transcript");
    var exportActions = root.querySelector("#export-actions");
    var pipelineContainer = root.querySelector("#video-pipeline");
    var pipelineStatus = root.querySelector("#video-pipeline-status");
    var lastResult = null;

    uploadZone.addEventListener("click", function () { fileInput.click(); });
    uploadZone.addEventListener("dragover", function (e) { e.preventDefault(); uploadZone.classList.add("dragover"); });
    uploadZone.addEventListener("dragleave", function () { uploadZone.classList.remove("dragover"); });
    uploadZone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) processFile(fileInput.files[0]);
    });

    function setProgress(pct, label) {
      progressFill.style.width = pct + "%";
      progressPct.textContent = Math.round(pct) + "%";
      if (label) progressLabel.textContent = label;
    }

    function processFile(file) {
      var ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "mp4" && ext !== "mov" && file.type.indexOf("video") !== 0) {
        EnablerToast.error("Invalid file", "Please upload MP4 or MOV files.");
        return;
      }

      uploadZone.querySelector("h3").textContent = file.name;
      uploadZone.querySelector("p").textContent = "Processing…";
      progressWrap.hidden = false;
      videoStatus.textContent = "Processing";
      videoStatus.className = "badge badge-warning";
      pipelineStatus.textContent = "Processing…";
      transcriptEmpty.hidden = false;
      transcript.hidden = true;
      exportActions.hidden = true;

      EnablerPipeline.render(pipelineContainer, [
        { id: "1", label: "Video upload", status: "complete", detail: file.name },
        { id: "2", label: "Frame extraction (MediaPipe)", status: "active" },
        { id: "3", label: "Hand landmark tracking", status: "pending" },
        { id: "4", label: "Backend sign-to-text", status: "pending" },
      ]);

      setProgress(10, "Extracting frames…");

      var progress = 10;
      var progressInterval = setInterval(function () {
        if (progress < 60) {
          progress += 5;
          setProgress(progress);
        }
      }, 300);

      EnablerSignEngine.processUploadedFile(file, 10)
        .then(function (frames) {
          clearInterval(progressInterval);
          setProgress(70, "Classifying gestures…");

          EnablerPipeline.update(pipelineContainer, [
            { id: "1", label: "Video upload", status: "complete" },
            { id: "2", label: "Frame extraction", status: "complete", detail: frames.length + " frames" },
            { id: "3", label: "Hand landmark tracking", status: "complete" },
            { id: "4", label: "Backend sign-to-text", status: "active" },
          ]);

          return EnablerAPI.signToText(frames);
        })
        .then(function (result) {
          lastResult = result;
          setProgress(100, "Complete");

          videoInfo.hidden = false;
          videoInfoText.textContent =
            file.name + " · " + (file.size / 1024 / 1024).toFixed(1) + " MB";

          var formatted = formatTimestampedTranscript(result.text, result.gestures);
          transcriptEmpty.hidden = true;
          transcript.hidden = false;
          exportActions.hidden = false;
          transcript.value = formatted;
          videoConfidence.textContent =
            "Confidence: " + Math.round(result.confidence * 100) + "% · Source: " + result.source;
          videoStatus.textContent = "Complete";
          videoStatus.className = "badge badge-success";
          pipelineStatus.textContent = "Complete";
          pipelineStatus.className = "badge badge-success";

          EnablerPipeline.update(pipelineContainer, result.pipeline.map(function (s, i) {
            return { id: String(i), label: s.label, status: s.status, detail: s.detail };
          }));

          EnablerState.push("videoTranscripts", {
            name: file.name,
            text: formatted,
            confidence: result.confidence,
            time: new Date().toISOString(),
          });

          EnablerToast.success("Transcript ready", "Deterministic pipeline complete.");
        })
        .catch(function (err) {
          clearInterval(progressInterval);
          videoStatus.textContent = "Error";
          pipelineStatus.textContent = "Error";
          EnablerToast.error("Processing failed", err.message);
        });
    }

    function formatTimestampedTranscript(text, gestures) {
      var lines = text.split(". ").filter(Boolean);
      var output = "";
      var interval = 5;
      lines.forEach(function (line, i) {
        var secs = i * interval;
        var ts =
          "[" +
          String(Math.floor(secs / 60)).padStart(2, "0") +
          ":" +
          String(secs % 60).padStart(2, "0") +
          "]";
        output += ts + " " + line.trim() + (line.endsWith(".") ? "" : ".") + "\n\n";
      });
      if (gestures && gestures.length) {
        output += "\n--- Detected Gestures ---\n";
        gestures.forEach(function (g) {
          output += g.label + " (" + Math.round(g.confidence * 100) + "%)\n";
        });
      }
      return output.trim();
    }

    root.querySelector("#btn-save").addEventListener("click", function () {
      EnablerToast.success("Saved", "Transcript saved to local history.");
    });

    root.querySelector("#btn-export-txt").addEventListener("click", function () {
      downloadFile(transcript.value, "enabler-transcript.txt", "text/plain");
    });

    root.querySelector("#btn-export-srt").addEventListener("click", function () {
      var srt = transcript.value
        .split("\n\n")
        .filter(function (b) { return b.trim(); })
        .map(function (block, i) {
          var match = block.match(/\[(\d+:\d+)\]\s*(.+)/);
          if (!match) return "";
          var parts = match[1].split(":");
          var start = "00:" + parts[0].padStart(2, "0") + ":" + parts[1].padStart(2, "0") + ",000";
          var endMin = parseInt(parts[0], 10);
          var endSec = parseInt(parts[1], 10) + 5;
          var end = "00:" + String(endMin).padStart(2, "0") + ":" + String(endSec).padStart(2, "0") + ",000";
          return (i + 1) + "\n" + start + " --> " + end + "\n" + match[2].trim();
        })
        .filter(Boolean)
        .join("\n\n");
      downloadFile(srt, "enabler-captions.srt", "text/plain");
    });

    function downloadFile(content, filename, type) {
      var blob = new Blob([content], { type: type });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      EnablerToast.success("Exported", filename + " downloaded.");
    }
  },
};
