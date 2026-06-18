window.EnablerPipeline = (function () {
  "use strict";

  function statusIcon(status) {
    if (status === "complete") return "✓";
    if (status === "active") return "●";
    if (status === "error") return "✕";
    return "○";
  }

  function render(container, steps) {
    if (!container) return;
    container.innerHTML =
      '<div class="pipeline" role="list" aria-label="Processing pipeline">' +
      steps
        .map(function (step) {
          return (
            '<div class="pipeline-step pipeline-step--' +
            step.status +
            '" role="listitem">' +
            '<span class="pipeline-step-icon" aria-hidden="true">' +
            statusIcon(step.status) +
            "</span>" +
            '<div class="pipeline-step-body">' +
            '<strong class="pipeline-step-label">' +
            step.label +
            "</strong>" +
            (step.detail
              ? '<span class="pipeline-step-detail">' + step.detail + "</span>"
              : "") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>";
  }

  function update(container, steps) {
    render(container, steps);
  }

  function createContainer(id) {
    return (
      '<div class="card" style="grid-column:1/-1" id="' +
      id +
      '-pipeline-card">' +
      '<div class="card-header"><h2 class="card-title">Processing Pipeline</h2>' +
      '<span class="badge badge-warning" id="' +
      id +
      '-pipeline-status">Processing…</span></div>' +
      '<div class="card-body" id="' +
      id +
      '-pipeline"></div></div>'
    );
  }

  return { render: render, update: update, createContainer: createContainer };
})();
