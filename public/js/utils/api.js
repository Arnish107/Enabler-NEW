window.EnablerAPI = (function () {
  "use strict";

  var isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (typeof window !== "undefined") {
    window.addEventListener("online", function () {
      isOnline = true;
    });
    window.addEventListener("offline", function () {
      isOnline = false;
    });
  }

  async function request(endpoint, body, options) {
    options = options || {};

    if (!isOnline && !options.allowOffline) {
      throw new Error("You are offline. Connect to the internet and try again.");
    }

    var response;
    try {
      response = await fetch(endpoint, {
        method: options.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error(
        "Cannot reach the Enabler API. Ensure the server is running.",
      );
    }

    var data = await response.json();

    if (!response.ok && !data.text && !data.transcript && !data.result) {
      throw new Error(data.message || data.error || "API request failed");
    }

    data._status = response.status;
    data._ok = response.ok;
    return data;
  }

  return {
    isOnline: function () {
      return isOnline;
    },

    health: function () {
      return fetch("/api/health")
        .then(function (response) {
          return response.json();
        })
        .catch(function () {
          throw new Error("API health check failed");
        });
    },

    speechToText: function (transcript, language, options) {
      options = options || {};
      return request("/api/speech-to-text", {
        transcript: transcript,
        language: language || "en-US",
        audio: options.audio || null,
        mimeType: options.mimeType || "audio/webm",
        enhance: options.enhance !== false,
      });
    },

    signToText: function (frames, options) {
      options = options || {};
      return request("/api/sign-to-text", {
        frames: frames,
        enhance: options.enhance !== false,
      });
    },

    translate: function (text, direction, sourceLang, targetLang, options) {
      options = options || {};
      return request("/api/translate", {
        text: text,
        direction: direction || "speech-to-sign",
        sourceLang: sourceLang || "en",
        targetLang: targetLang || "asl",
        enhance: options.enhance === true,
      });
    },

    aiProcess: function (text, task, context) {
      return request("/api/ai-process", {
        text: text,
        task: task,
        context: context || {},
      });
    },
  };
})();
