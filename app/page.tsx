export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#app-main">
        Skip to main content
      </a>

      <header className="site-header" role="banner">
        <nav className="nav" aria-label="Main navigation">
          <a className="nav-brand" href="#/" aria-label="Enabler home">
            <img
              src="/assets/logo-light.svg"
              alt="Enabler"
              className="nav-logo-img"
              data-logo
              width={160}
              height={38}
            />
          </a>

          <div className="nav-center" id="nav-center">
            <a href="#/" className="nav-link" data-route="home">
              Home
            </a>
            <a href="#/speech-sign" className="nav-link" data-route="speech-sign">
              Speech → Sign
            </a>
            <a href="#/sign-text" className="nav-link" data-route="sign-text">
              Sign → Text
            </a>
            <a href="#/live" className="nav-link" data-route="live">
              Live
            </a>
            <a href="#/video" className="nav-link" data-route="video">
              Video
            </a>
          </div>

          <div className="nav-actions">
            <button
              className="btn btn-ghost btn-icon-only"
              id="sidebar-toggle"
              type="button"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <button
              className="btn btn-ghost btn-icon-only"
              id="theme-toggle"
              type="button"
              aria-label="Switch to dark mode"
            >
              🌙
            </button>
            <a href="#/emergency" className="btn btn-primary btn-sm">
              Emergency
            </a>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="nav-center"
              aria-label="Open menu"
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          </div>
        </nav>
      </header>

      <div className="app-shell">
        <aside
          className="app-sidebar"
          id="app-sidebar"
          aria-label="Feature navigation"
        >
          <p className="sidebar-label">Tools</p>
          <ul className="sidebar-nav" />
        </aside>

        <main className="app-main" id="app-main" tabIndex={-1} />
      </div>

      <div
        className="toast-container"
        id="toast-container"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
}
