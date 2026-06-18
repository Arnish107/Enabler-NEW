window.EnablerSpeechEngine = (function () {
  "use strict";

  var recognition = null;
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSupported() {
    return !!SpeechRecognition;
  }

  function start(onInterim, onFinal, onError) {
    if (!isSupported()) {
      onError(new Error("Web Speech API is not supported in this browser."));
      return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    var finalTranscript = "";

    recognition.onresult = function (event) {
      var interim = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
          if (onFinal) onFinal(finalTranscript.trim(), event.results[i][0].confidence);
        } else {
          interim += t;
        }
      }
      if (onInterim) onInterim((finalTranscript + interim).trim());
    };

    recognition.onerror = function (event) {
      if (onError) onError(new Error(event.error || "Speech recognition error"));
    };

    recognition.start();
    return recognition;
  }

  function stop() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  }

  return { isSupported: isSupported, start: start, stop: stop };
})();
