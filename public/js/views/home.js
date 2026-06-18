window.EnablerViews = window.EnablerViews || {};

EnablerViews.home = {
  render: function () {
    var isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    var logoSrc = isDark ? "assets/logo-dark.svg" : "assets/logo-light.svg";

    return (
      '<div class="hero">' +
      '<div class="hero-bg" aria-hidden="true"></div>' +
      '<div class="hero-inner">' +
      '<img src="' +
      logoSrc +
      '" alt="Enabler" class="hero-logo" width="220" height="52" />' +
      '<p class="hero-eyebrow">AI-Powered Accessibility</p>' +
      '<h1 class="hero-title">Breaking communication barriers</h1>' +
      '<p class="hero-subtitle">Real-time speech, sign language, and live conversation tools designed for deaf and hard-of-hearing users.</p>' +
      '<div class="hero-actions">' +
      '<a href="#/speech-sign" class="btn btn-primary btn-lg">Speech → Sign</a>' +
      '<a href="#/sign-text" class="btn btn-secondary btn-lg">Sign → Text</a>' +
      "</div></div></div>" +
      '<section class="features-section" aria-labelledby="features-title">' +
      '<header class="section-header">' +
      '<h2 id="features-title" class="section-title">Powerful accessibility tools</h2>' +
      '<p class="section-subtitle">Every feature is interactive and ready to use. Click any card to get started.</p>' +
      "</header>" +
      '<div class="features-grid">' +
      featureCard("speech-sign", "🎤", "Speech to Sign", "Convert spoken language into sign language animations in real time.") +
      featureCard("sign-text", "🤟", "Sign to Text", "Recognize sign language from camera or video and translate to text.") +
      featureCard("live", "💬", "Live Conversations", "Split-screen real-time translation between speech and sign.") +
      featureCard("video", "🎬", "Video Translation", "Upload videos and get accessible transcripts and captions.") +
      featureCard("alerts", "🔔", "Sound Alerts", "Visual notifications for doorbells, alarms, and environmental sounds.") +
      featureCard("emergency", "🚨", "Emergency Communication", "Quick-access cards for critical situations.") +
      "</div></section>" +
      '<section class="about-section" aria-labelledby="about-title">' +
      '<div class="about-grid">' +
      '<div class="about-content">' +
      '<h2 id="about-title" class="section-title">Built for real-world accessibility</h2>' +
      "<p>Enabler bridges the gap between spoken language and sign language with AI-powered tools that work across mobile, tablet, and desktop.</p>" +
      "<p>Designed with accessibility at its core — high contrast, keyboard navigation, screen reader support, and responsive layouts for every user.</p>" +
      '<ul class="about-list">' +
      "<li>Real-time translation workflows</li>" +
      "<li>Multiple sign language support</li>" +
      "<li>Privacy-first architecture</li>" +
      "<li>Production-ready interface</li>" +
      "</ul></div>" +
      '<div class="card stats-card">' +
      statItem("24/7", "Always available") +
      statItem("Real-time", "Translation engine") +
      statItem("Inclusive", "By design") +
      "</div></div></section>" +
      '<footer class="site-footer" role="contentinfo">' +
      '<div class="footer-inner">' +
      '<div><img src="' +
      logoSrc +
      '" alt="Enabler" class="nav-logo-img" width="160" height="38" /><p class="footer-tagline">Breaking communication barriers through AI accessibility tools.</p></div>' +
      '<div><h3 class="footer-heading">Tools</h3><ul class="footer-links">' +
      '<li><a href="#/speech-sign">Speech to Sign</a></li>' +
      '<li><a href="#/sign-text">Sign to Text</a></li>' +
      '<li><a href="#/live">Live Conversation</a></li>' +
      "</ul></div>" +
      '<div><h3 class="footer-heading">Contact</h3><p><a href="mailto:hello@enabler.app">hello@enabler.app</a></p></div>' +
      "</div>" +
      '<div class="footer-bottom"><p>&copy; ' +
      new Date().getFullYear() +
      " Enabler. All rights reserved.</p></div></footer>"
    );
  },
  init: function () {},
};

function featureCard(route, icon, title, desc) {
  return (
    '<a href="#/' +
    route +
    '" class="feature-card-link"><article class="card feature-card">' +
    '<div class="feature-icon-wrap" aria-hidden="true">' +
    icon +
    "</div>" +
    "<h3>" +
    title +
    "</h3><p>" +
    desc +
    '</p><span class="link-arrow">Open tool →</span></article></a>'
  );
}

function statItem(value, label) {
  return (
    '<div class="stat-item"><span class="stat-value">' +
    value +
    '</span><span class="stat-label">' +
    label +
    "</span></div>"
  );
}
