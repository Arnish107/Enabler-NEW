window.EnablerViews = window.EnablerViews || {};

EnablerViews["sign-text"] = {
  render: function () {
    return (
      '<div class="page-header">' +
      '<h1 class="page-title">Sign → Text</h1>' +
      '<p class="page-desc">Capture sign language via camera or video. MediaPipe extracts hand landmarks, the backend classifies gestures, and outputs structured text.</p>' +
      "</div>" +
      EnablerPipeline.createContainer("sign") +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Camera / Video</h2></div>' +
      '<div class="card-body">' +
      '<div class="camera-preview" id="camera-preview">' +
      '<div class="camera-placeholder" id="camera-placeholder">' +
      '<p style="font-size:2rem;margin:0 0 0.5rem">📷</p><p>Camera preview will appear here</p></div>' +
      '<video id="camera-video" autoplay playsinline muted hidden></video>' +
      '<canvas id="hand-canvas" hidden style="position:absolute;inset:0;width:100%;height:100%"></canvas>' +
      "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem">' +
      '<button class="btn btn-secondary btn-sm" id="btn-camera" type="button">Open Camera</button>' +
      '<button class="btn btn-secondary btn-sm" id="btn-capture" type="button" disabled>Capture Frame</button>' +
      '<button class="btn btn-ghost btn-sm" id="btn-stop-camera" type="button" hidden>Stop Camera</button>' +
      "</div>" +
      '<div class="upload-zone" id="upload-zone" style="margin-top:1rem">' +
      '<input type="file" id="file-input" accept="video/mp4,video/quicktime,video/*" hidden />' +
      '<div class="upload-zone-icon">📁</div>' +
      "<h3>Upload video file</h3>" +
      "<p>Drag & drop or click to upload MP4/MOV</p>" +
      "</div></div></div>" +
      '<div class="card"><div class="card-header"><h2 class="card-title">Text Output</h2>' +
      '<span class="badge" id="convert-status">Ready</span></div>' +
      '<div class="card-body">' +
      '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--text-muted)" id="confidence-display"></p>' +
      '<div class="form-group"><label class="form-label" for="sign-output">Translated Text</label>' +
      '<textarea class="form-textarea" id="sign-output" rows="8" placeholder="Converted text will appear here..." readonly></textarea></div>' +
      '<div id="gesture-list" style="margin-bottom:1rem"></div>' +
      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="btn-convert" type="button" disabled>Convert</button>' +
      '<button class="btn btn-secondary" id="btn-download" type="button" disabled>Download Transcript</button>' +
      "</div></div></div></div>"
    );
  },

  init: function (root) {
    var video = root.querySelector("#camera-video");
    var placeholder = root.querySelector("#camera-placeholder");
    var stream = null;
    var output = root.querySelector("#sign-output");
    var convertStatus = root.querySelector("#convert-status");
    var btnConvert = root.querySelector("#btn-convert");
    var btnDownload = root.querySelector("#btn-download");
    var btnCamera = root.querySelector("#btn-camera");
    var btnCapture = root.querySelector("#btn-capture");
    var btnStop = root.querySelector("#btn-stop-camera");
    var uploadZone = root.querySelector("#upload-zone");
    var fileInput = root.querySelector("#file-input");
    var pipelineContainer = root.querySelector("#sign-pipeline");
    var pipelineStatus = root.querySelector("#sign-pipeline-status");
    var confidenceDisplay = root.querySelector("#confidence-display");
    var gestureList = root.querySelector("#gesture-list");
    var capturedFrames = [];
    var uploadedFile = null;

    btnCamera.addEventListener("click", function () {
      if (stream) return;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then(function (s) {
          stream = s;
          video.srcObject = s;
          video.hidden = false;
          placeholder.hidden = true;
          btnCamera.disabled = true;
          btnCapture.disabled = false;
          btnStop.hidden = false;
          btnConvert.disabled = false;
          EnablerSignEngine.loadMediaPipe().then(function () {
            EnablerToast.success("Camera active", "MediaPipe Hands loaded. Capture frames or convert live.");
          });
        })
        .catch(function () {
          EnablerToast.error("Camera unavailable", "Please allow camera access or upload a video.");
        });
    });

    btnStop.addEventListener("click", function () {
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
      video.hidden = true;
      placeholder.hidden = false;
      placeholder.innerHTML = '<p style="font-size:2rem;margin:0 0 0.5rem">📷</p><p>Camera preview will appear here</p>';
      btnCamera.disabled = false;
      btnCapture.disabled = true;
      btnStop.hidden = true;
      capturedFrames = [];
    });

    btnCapture.addEventListener("click", function () {
      if (!video.srcObject) return;
      btnCapture.disabled = true;
      convertStatus.textContent = "Capturing";
      convertStatus.className = "badge badge-warning";

      EnablerSignEngine.captureFrameFromVideo(video)
        .then(function (frame) {
          btnCapture.disabled = false;
          if (frame) {
            capturedFrames.push(frame);
            EnablerToast.success("Frame captured", capturedFrames.length + " frame(s) ready.");
          } else {
            EnablerToast.warning("No hands detected", "Position your hands clearly in frame.");
          }
          convertStatus.textContent = "Ready";
          convertStatus.className = "badge";
        });
    });

    uploadZone.addEventListener("click", function () { fileInput.click(); });
    uploadZone.addEventListener("dragover", function (e) { e.preventDefault(); uploadZone.classList.add("dragover"); });
    uploadZone.addEventListener("dragleave", function () { uploadZone.classList.remove("dragover"); });
    uploadZone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
      uploadedFile = file;
      capturedFrames = [];
      uploadZone.querySelector("h3").textContent = file.name;
      uploadZone.querySelector("p").textContent = (file.size / 1024 / 1024).toFixed(2) + " MB — ready to convert";
      btnConvert.disabled = false;
      EnablerToast.success("File uploaded", file.name);
    }

    btnConvert.addEventListener("click", function () {
      convertStatus.textContent = "Processing";
      convertStatus.className = "badge badge-warning";
      btnConvert.disabled = true;
      output.value = "";
      gestureList.innerHTML = "";
      pipelineStatus.textContent = "Processing…";

      EnablerPipeline.render(pipelineContainer, [
        { id: "1", label: "Video input", status: "active" },
        { id: "2", label: "Frame extraction", status: "pending" },
        { id: "3", label: "MediaPipe hand tracking", status: "pending" },
        { id: "4", label: "Backend gesture classification", status: "pending" },
        { id: "5", label: "Language model assembly", status: "pending" },
      ]);

      var framePromise;
      if (uploadedFile) {
        framePromise = EnablerSignEngine.processUploadedFile(uploadedFile, 8);
      } else if (capturedFrames.length) {
        framePromise = Promise.resolve(capturedFrames);
      } else if (video.srcObject) {
        framePromise = EnablerSignEngine.captureFrameFromVideo(video).then(function (f) {
          return f ? [f] : [];
        });
      } else {
        btnConvert.disabled = false;
        convertStatus.textContent = "Ready";
        EnablerToast.error("No input", "Open camera, capture frames, or upload a video.");
        return;
      }

      framePromise
        .then(function (frames) {
          EnablerPipeline.update(pipelineContainer, [
            { id: "1", label: "Video input", status: "complete" },
            { id: "2", label: "Frame extraction", status: "complete", detail: frames.length + " frames" },
            { id: "3", label: "MediaPipe hand tracking", status: "complete" },
            { id: "4", label: "Backend gesture classification", status: "active" },
            { id: "5", label: "Language model assembly", status: "pending" },
          ]);

          if (!frames.length) {
            throw new Error("No hand landmarks detected. Ensure hands are visible.");
          }

          return EnablerAPI.signToText(frames);
        })
        .then(function (result) {
          output.value = result.text;
          confidenceDisplay.textContent =
            "Classification confidence: " + Math.round(result.confidence * 100) + "%";
          convertStatus.textContent = "Complete";
          convertStatus.className = "badge badge-success";
          btnConvert.disabled = false;
          btnDownload.disabled = false;
          pipelineStatus.textContent = "Complete";
          pipelineStatus.className = "badge badge-success";

          EnablerPipeline.update(pipelineContainer, result.pipeline.map(function (s, i) {
            return { id: String(i), label: s.label, status: s.status, detail: s.detail };
          }));

          if (result.gestures && result.gestures.length) {
            gestureList.innerHTML = result.gestures
              .map(function (g) {
                return '<span class="badge">' + g.label + " (" + Math.round(g.confidence * 100) + "%)</span>";
              })
              .join(" ");
          }

          EnablerState.push("signTranscripts", {
            text: result.text,
            confidence: result.confidence,
            time: new Date().toISOString(),
          });
          EnablerToast.success("Conversion complete", "Deterministic gesture classification finished.");
        })
        .catch(function (err) {
          convertStatus.textContent = "Error";
          convertStatus.className = "badge";
          btnConvert.disabled = false;
          pipelineStatus.textContent = "Error";
          EnablerToast.error("Conversion failed", err.message);
        });
    });

    btnDownload.addEventListener("click", function () {
      if (!output.value) return;
      var blob = new Blob([output.value], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "enabler-transcript-" + Date.now() + ".txt";
      a.click();
      URL.revokeObjectURL(url);
      EnablerToast.success("Downloaded", "Transcript saved.");
    });
  },
};
