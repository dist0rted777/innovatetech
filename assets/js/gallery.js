/* Engineering projects grid + lightbox gallery. Reads window.PROJECTS. Vanilla, no deps. */
(function () {
  var PROJECTS = window.PROJECTS || [];
  var CAT_LABELS = { cad: "CAD", schematics: "Schematics", photos: "Photos" };
  var grid = document.getElementById("engGrid");
  if (!grid || !PROJECTS.length) return;

  /* ---------- Build the card grid ---------- */
  PROJECTS.forEach(function (p, i) {
    var cats = Object.keys(p.categories);
    var chips = cats
      .map(function (c) {
        return p.categories[c].length + " " + CAT_LABELS[c];
      })
      .join(" · ");

    var card = document.createElement("button");
    card.className = "eng-card" + (p.flagship ? " flagship" : "");
    card.type = "button";
    card.setAttribute("aria-label", "Open gallery: " + p.title);
    card.dataset.index = i;
    card.innerHTML =
      '<span class="ec-media">' +
      (p.thumb ? '<img src="' + p.thumb + '" alt="" loading="lazy">' : "") +
      (p.flagship ? '<span class="ec-flag">★ Final-year flagship</span>' : "") +
      "</span>" +
      '<span class="ec-body">' +
      "<span class='ec-title'>" + p.title + "</span>" +
      "<span class='ec-blurb'>" + p.blurb + "</span>" +
      (p.tech && p.tech.length
        ? "<span class='ec-tech'>" +
          p.tech.map(function (t) { return "<span class='tech'>" + t + "</span>"; }).join("") +
          "</span>"
        : "") +
      "<span class='ec-chips'>" + chips + "</span>" +
      "</span>";
    card.addEventListener("click", function () {
      openLightbox(i);
    });
    grid.appendChild(card);
  });

  /* ---------- Lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Project gallery");
  lb.innerHTML =
    '<div class="lb-backdrop" data-close></div>' +
    '<div class="lb-panel" role="document">' +
    '<header class="lb-head">' +
    "<div class='lb-headtext'><h3 class='lb-title'></h3><div class='lb-tabs' role='tablist'></div></div>" +
    "<button class='lb-close' data-close type='button' aria-label='Close gallery'>✕</button>" +
    "</header>" +
    '<div class="lb-stage">' +
    "<button class='lb-nav lb-prev' type='button' aria-label='Previous image'>‹</button>" +
    "<figure class='lb-figure'><img class='lb-img' alt=''></figure>" +
    "<button class='lb-nav lb-next' type='button' aria-label='Next image'>›</button>" +
    "</div>" +
    '<footer class="lb-foot">' +
    "<div class='lb-strip'></div>" +
    "<div class='lb-meta'><span class='lb-counter'></span>" +
    "<a class='lb-pdf btn btn-outline' hidden target='_blank' rel='noopener'>⬇ Download drawing (PDF)</a></div>" +
    "</footer>" +
    "</div>";
  document.body.appendChild(lb);

  var elImg = lb.querySelector(".lb-img");
  var elTitle = lb.querySelector(".lb-title");
  var elTabs = lb.querySelector(".lb-tabs");
  var elStrip = lb.querySelector(".lb-strip");
  var elCounter = lb.querySelector(".lb-counter");
  var elPdf = lb.querySelector(".lb-pdf");
  var elFigure = lb.querySelector(".lb-figure");

  var state = { project: null, cat: null, index: 0, lastFocus: null };

  function openLightbox(i) {
    state.project = PROJECTS[i];
    state.cat = Object.keys(state.project.categories)[0];
    state.index = 0;
    state.lastFocus = document.activeElement;
    elTitle.textContent = state.project.title;
    if (state.project.pdf) {
      elPdf.hidden = false;
      elPdf.href = state.project.pdf;
    } else {
      elPdf.hidden = true;
    }
    renderTabs();
    renderImage();
    lb.hidden = false;
    document.body.classList.add("lb-open");
    lb.querySelector(".lb-close").focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    elImg.src = "";
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function renderTabs() {
    var cats = Object.keys(state.project.categories);
    elTabs.innerHTML = "";
    elTabs.style.display = cats.length > 1 ? "" : "none";
    cats.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lb-tab" + (c === state.cat ? " active" : "");
      b.textContent = CAT_LABELS[c] + " (" + state.project.categories[c].length + ")";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", c === state.cat ? "true" : "false");
      b.addEventListener("click", function () {
        state.cat = c;
        state.index = 0;
        renderTabs();
        renderImage();
      });
      elTabs.appendChild(b);
    });
  }

  function currentList() {
    return state.project.categories[state.cat];
  }

  function renderImage() {
    var list = currentList();
    var item = list[state.index];
    elImg.src = item.full;
    elImg.alt = state.project.title + " — " + CAT_LABELS[state.cat] + " " + (state.index + 1);
    elCounter.textContent =
      CAT_LABELS[state.cat] + " " + (state.index + 1) + " / " + list.length;
    var single = list.length < 2;
    lb.querySelector(".lb-prev").style.visibility = single ? "hidden" : "";
    lb.querySelector(".lb-next").style.visibility = single ? "hidden" : "";
    // thumb strip
    elStrip.innerHTML = "";
    list.forEach(function (it, idx) {
      var t = document.createElement("button");
      t.type = "button";
      t.className = "lb-thumb" + (idx === state.index ? " active" : "");
      t.innerHTML = '<img src="' + it.thumb + '" alt="" loading="lazy">';
      t.addEventListener("click", function () {
        state.index = idx;
        renderImage();
      });
      elStrip.appendChild(t);
    });
    var active = elStrip.querySelector(".lb-thumb.active");
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function step(dir) {
    var list = currentList();
    state.index = (state.index + dir + list.length) % list.length;
    renderImage();
  }

  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  elFigure.addEventListener("click", function (e) { if (e.target === elFigure) closeLightbox(); });
  lb.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
})();
