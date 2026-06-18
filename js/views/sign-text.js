window.EnablerViews = window.EnablerViews || {};

EnablerViews["sign-text"] = {
  render: function () {
    return (
      '<div class="page-header">' +
      "<h1 class=\"page-title\">Sign → Text</h1>" +
      '<p class="page-desc">Upload a video, use your camera, or record sign language to convert it into readable text.</p>' +
      "</div>" +
      '<div class="page-grid page-grid-2">' +
      '<div class="card"><div class="card-header"><h2 class="card-title">Camera / Video</h2></div>' +
      '<div class="card-body">' +
      '<div class="camera-preview" id="camera-preview">' +
      '<div class="camera-placeholder" id="camera-placeholder">' +
      '<p style="font-size:2rem;margin:0 0 0.5rem">📷</p><p>Camera preview will appear here</p></div>' +
      '<video id="camera-video" autoplay playsinline muted hidden></video>' +
      "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem">' +
      '<button class="btn btn-secondary btn-sm" id="btn-camera" type="button">Open Camera</button>' +
      '<button class="btn btn-secondary btn-sm" id="btn-record" type="button" disabled>Record Video</button>' +
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
      '<div class="form-group"><label class="form-label" for="sign-output">Translated Text</label>' +
      '<textarea class="form-textarea" id="sign-output" rows="8" placeholder="Converted text will appear here..." readonly></textarea></div>' +
      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="btn-convert" type="button">Convert</button>' +
      '<button class="btn btn-secondary" id="btn-download" type="button" disabled>Download Transcript</button>' +
      "</div></div></div></div>"
    );
  },

  init: function (root) {
    var video = root.querySelector("#camera-video");
    var placeholder = root.querySelector("#camera-placeholder");
    var stream = null;
    var isRecording = false;
    var mediaRecorder = null;
    var recordedChunks = [];
    var output = root.querySelector("#sign-output");
    var convertStatus = root.querySelector("#convert-status");
    var btnConvert = root.querySelector("#btn-convert");
    var btnDownload = root.querySelector("#btn-download");
    var btnCamera = root.querySelector("#btn-camera");
    var btnRecord = root.querySelector("#btn-record");
    var btnStop = root.querySelector("#btn-stop-camera");
    var uploadZone = root.querySelector("#upload-zone");
    var fileInput = root.querySelector("#file-input");

    var mockTranscripts = [
      "Hello, my name is Alex. I am learning American Sign Language.",
      "Can you help me find the nearest exit?",
      "Thank you for waiting. I appreciate your patience.",
      "I need to schedule an appointment for next Tuesday.",
    ];

    btnCamera.addEventListener("click", function () {
      if (stream) return;
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (s) {
          stream = s;
          video.srcObject = s;
          video.hidden = false;
          placeholder.hidden = true;
          btnCamera.disabled = true;
          btnRecord.disabled = false;
          btnStop.hidden = false;
          EnablerToast.success("Camera active", "Point camera at sign language input.");
        })
        .catch(function () {
          EnablerToast.error("Camera unavailable", "Using simulated preview instead.");
          placeholder.innerHTML =
            '<p style="font-size:2rem;margin:0 0 0.5rem">🤟</p><p>Simulated sign detection active</p>';
          btnRecord.disabled = false;
        });
    });

    btnStop.addEventListener("click", function () {
      if (stream) {
        stream.getTracks().forEach(function (t) {
          t.stop();
        });
        stream = null;
      }
      video.hidden = true;
      placeholder.hidden = false;
      placeholder.innerHTML =
        '<p style="font-size:2rem;margin:0 0 0.5rem">📷</p><p>Camera preview will appear here</p>';
      btnCamera.disabled = false;
      btnRecord.disabled = true;
      btnStop.hidden = true;
      isRecording = false;
    });

    btnRecord.addEventListener("click", function () {
      if (isRecording) {
        stopRecording();
        return;
      }
      isRecording = true;
      btnRecord.textContent = "Stop Recording";
      recordedChunks = [];

      var dot = document.createElement("div");
      dot.className = "recording-dot";
      dot.textContent = "REC";
      root.querySelector("#camera-preview").appendChild(dot);

      if (stream) {
        try {
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) recordedChunks.push(e.data);
          };
          mediaRecorder.start();
        } catch (e) {
          /* simulated */
        }
      }

      EnablerToast.info("Recording", "Capturing sign language video...");
    });

    function stopRecording() {
      isRecording = false;
      btnRecord.textContent = "Record Video";
      var dot = root.querySelector(".recording-dot");
      if (dot) dot.remove();
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      EnablerToast.success("Recording saved", "Ready to convert.");
    }

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
      if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
      uploadZone.querySelector("h3").textContent = file.name;
      uploadZone.querySelector("p").textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB — ready to convert";
      EnablerToast.success("File uploaded", file.name);
    }

    btnConvert.addEventListener("click", function () {
      convertStatus.textContent = "Processing";
      convertStatus.className = "badge badge-warning";
      btnConvert.disabled = true;
      output.value = "";

      var skeleton =
        '<div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div>';
      var wrapper = document.createElement("div");
      wrapper.innerHTML = skeleton;
      output.parentNode.insertBefore(wrapper, output);
      output.hidden = true;

      setTimeout(function () {
        wrapper.remove();
        output.hidden = false;
        var text =
          mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
        output.value = text;
        convertStatus.textContent = "Complete";
        convertStatus.className = "badge badge-success";
        btnConvert.disabled = false;
        btnDownload.disabled = false;
        EnablerState.push("signTranscripts", {
          text: text,
          time: new Date().toISOString(),
        });
        EnablerToast.success("Conversion complete", "Transcript ready for download.");
      }, 1800);
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
      EnablerToast.success("Downloaded", "Transcript saved to your device.");
    });
  },
};
