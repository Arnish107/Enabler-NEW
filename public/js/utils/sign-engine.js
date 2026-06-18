window.EnablerSignEngine = (function () {
  "use strict";

  var handsInstance = null;
  var loadPromise = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadMediaPipe() {
    if (loadPromise) return loadPromise;

    loadPromise = loadScript(
      "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js",
    ).then(function () {
      if (!window.Hands) {
        throw new Error("MediaPipe Hands failed to load");
      }
      handsInstance = new window.Hands({
        locateFile: function (file) {
          return (
            "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/" +
            file
          );
        },
      });
      handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });
      return handsInstance;
    });

    return loadPromise;
  }

  function detectHandsInImage(imageSource) {
    return loadMediaPipe().then(function (hands) {
      return new Promise(function (resolve) {
        hands.onResults(function (results) {
          var landmarks = [];
          if (results.multiHandLandmarks && results.multiHandLandmarks.length) {
            landmarks = results.multiHandLandmarks[0].map(function (lm) {
              return { x: lm.x, y: lm.y, z: lm.z };
            });
          }
          resolve(landmarks);
        });
        hands.send({ image: imageSource });
      });
    });
  }

  function waitForVideoReady(video) {
    return new Promise(function (resolve) {
      if (video.readyState >= 2) {
        resolve();
        return;
      }
      video.onloadeddata = function () {
        resolve();
      };
    });
  }

  function seekVideo(video, time) {
    return new Promise(function (resolve) {
      var onSeeked = function () {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = time;
    });
  }

  function extractFramesFromVideo(video, frameCount) {
    frameCount = frameCount || 8;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var frames = [];
    var duration = video.duration || 3;

    return waitForVideoReady(video).then(function () {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      var step = duration / frameCount;
      var chain = Promise.resolve();

      for (var i = 0; i < frameCount; i++) {
        (function (index) {
          chain = chain.then(function () {
            return seekVideo(video, Math.min(index * step, duration - 0.1));
          }).then(function () {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return detectHandsInImage(canvas).then(function (landmarks) {
              if (landmarks.length >= 21) {
                frames.push({
                  landmarks: landmarks,
                  timestamp: index * step,
                });
              }
            });
          });
        })(i);
      }

      return chain.then(function () {
        return frames;
      });
    });
  }

  function captureFrameFromVideo(video) {
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return detectHandsInImage(canvas).then(function (landmarks) {
      if (landmarks.length < 21) return null;
      return { landmarks: landmarks, timestamp: Date.now() };
    });
  }

  function processVideoElement(video, frameCount) {
    return extractFramesFromVideo(video, frameCount || 8);
  }

  function processUploadedFile(file, frameCount) {
    return new Promise(function (resolve, reject) {
      var video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);
      video.onerror = function () {
        URL.revokeObjectURL(video.src);
        reject(new Error("Could not load video file"));
      };
      processVideoElement(video, frameCount)
        .then(function (frames) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        })
        .catch(reject);
    });
  }

  return {
    loadMediaPipe: loadMediaPipe,
    processVideoElement: processVideoElement,
    processUploadedFile: processUploadedFile,
    captureFrameFromVideo: captureFrameFromVideo,
  };
})();
