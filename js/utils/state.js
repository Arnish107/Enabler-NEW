window.EnablerState = (function () {
  var STORAGE_KEY = "enabler-app-state";

  var defaults = {
    speechHistory: [],
    signTranscripts: [],
    liveMessages: [],
    videoTranscripts: [],
    soundAlerts: {
      doorbell: true,
      fireAlarm: true,
      babyCrying: false,
      phoneRinging: true,
      carHorn: false,
    },
    theme: "light",
  };

  var state = load();

  function load() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaults, JSON.parse(saved));
      }
    } catch (e) {
      /* ignore */
    }
    return Object.assign({}, defaults);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function get(key) {
    return state[key];
  }

  function set(key, value) {
    state[key] = value;
    save();
  }

  function push(key, item) {
    if (!Array.isArray(state[key])) state[key] = [];
    state[key].unshift(item);
    if (state[key].length > 50) state[key].pop();
    save();
  }

  return { get: get, set: set, push: push, save: save };
})();
