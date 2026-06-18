window.EnablerViews = window.EnablerViews || {};

EnablerViews.video = {
  render: function () {
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Video Translation</h1>" +
      '<p class="page-desc">Upload MP4 or MOV files to generate accessible transcripts with sign language annotations.</p>' +
      "</div>" +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Upload Video</h2></div>' +
      '<div class="card-body">' +
      '<div class="upload-zone" id="video-upload">' +
      '<input type="file" id="video-file" accept="video/mp4,video/quicktime,.mp4,.mov" hidden />' +
      '<div class="upload-zone-icon">🎬</div>' +
      "<h3>Drop your video here</h3>" +
      "<p>Supports MP4 and MOV files up to 500MB</p>" +
      "</div>" +
      '<div id="upload-progress" hidden style="margin-top:1.5rem">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">' +
      '<span style="font-size:0.875rem;font-weight:600" id="progress-label">Uploading...</span>' +
      '<span style="font-size:0.875rem;color:var(--text-muted)" id="progress-pct">0%</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>' +
      "</div>" +
      '<div id="video-info" hidden style="margin-top:1rem;padding:1rem;background:var(--bg-subtle);border-radius:var(--radius)">' +
      '<p style="margin:0;font-size:0.875rem" id="video-info-text"></p></div>' +
      "</div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Transcript Output</h2>' +
      '<span class="badge" id="video-status">Waiting</span></div>' +
      '<div class="card-body" style="position:relative" id="transcript-panel">' +
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
    var transcriptEmpty = root.querySelector("#transcript-empty");
    var transcript = root.querySelector("#video-transcript");
    var exportActions = root.querySelector("#export-actions");
    var currentFile = null;

    var mockTranscript =
      "[00:00:00] Welcome to this accessibility demonstration.\n\n" +
      "[00:00:05] Today we will explore how sign language translation works.\n\n" +
      "[00:00:12] Enabler converts speech and sign into accessible formats.\n\n" +
      "[00:00:20] This transcript includes timestamps for easy navigation.\n\n" +
      "[00:00:28] Thank you for using Enabler.";

    uploadZone.addEventListener("click", function () {
      fileInput.click();
    });

    uploadZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      uploadZone.classList.add("dragover");
    });

    uploadZone.addEventListener("dragleave", function () {
      uploadZone.classList.remove("dragover");
    });

    uploadZone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) processFile(fileInput.files[0]);
    });

    function processFile(file) {
      var validTypes = ["video/mp4", "video/quicktime"];
      var ext = file.name.split(".").pop().toLowerCase();
      if (!validTypes.includes(file.type) && ext !== "mp4" && ext !== "mov") {
        EnablerToast.error("Invalid file", "Please upload MP4 or MOV files.");
        return;
      }

      currentFile = file;
      uploadZone.querySelector("h3").textContent = file.name;
      uploadZone.querySelector("p").textContent = "Processing...";
      progressWrap.hidden = false;
      videoStatus.textContent = "Uploading";
      videoStatus.className = "badge badge-warning";

      var progress = 0;
      var interval = setInterval(function () {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          onUploadComplete(file);
        }
        progressFill.style.width = progress + "%";
        progressPct.textContent = Math.round(progress) + "%";
      }, 200);
    }

    function onUploadComplete(file) {
      progressLabel.textContent = "Processing complete";
      videoInfo.hidden = false;
      videoInfoText.textContent =
        file.name +
        " · " +
        (file.size / 1024 / 1024).toFixed(1) +
        " MB · Duration: ~2:34";

      videoStatus.textContent = "Translating";
      EnablerToast.info("Upload complete", "Generating transcript...");

      setTimeout(function () {
        transcriptEmpty.hidden = true;
        transcript.hidden = false;
        exportActions.hidden = false;
        transcript.value = mockTranscript;
        videoStatus.textContent = "Complete";
        videoStatus.className = "badge badge-success";

        EnablerState.push("videoTranscripts", {
          name: file.name,
          text: mockTranscript,
          time: new Date().toISOString(),
        });

        EnablerToast.success("Transcript ready", "You can save or export the output.");
      }, 2000);
    }

    root.querySelector("#btn-save").addEventListener("click", function () {
      EnablerToast.success("Saved", "Transcript saved to local history.");
    });

    root.querySelector("#btn-export-txt").addEventListener("click", function () {
      downloadFile(transcript.value, "enabler-transcript.txt", "text/plain");
    });

    root.querySelector("#btn-export-srt").addEventListener("click", function () {
      var srt =
        "1\n00:00:00,000 --> 00:00:05,000\nWelcome to this accessibility demonstration.\n\n" +
        "2\n00:00:05,000 --> 00:00:12,000\nToday we will explore sign language translation.\n\n" +
        "3\n00:00:12,000 --> 00:00:20,000\nEnabler converts speech and sign into accessible formats.\n\n" +
        "4\n00:00:20,000 --> 00:00:28,000\nThank you for using Enabler.";
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
