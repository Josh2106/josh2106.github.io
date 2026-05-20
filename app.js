// ─────────────────────────────────────────────────────────
// Portfolio interactions — vanilla JS, no libraries.
// ─────────────────────────────────────────────────────────

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

document.getElementById("year").textContent = new Date().getFullYear();

// ─────────────────────────────────────────────────────────
// Custom cursor
// ─────────────────────────────────────────────────────────
const cursor = $("#cursor");
const cursorDot = $("#cursor-dot");
let mouseX = 0, mouseY = 0, cx = 0, cy = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

function animateCursor() {
  cx += (mouseX - cx) * 0.18;
  cy += (mouseY - cy) * 0.18;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Add hover class on interactive elements
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("a, button, [data-cursor='hover']")) {
    cursor.classList.add("hover");
  }
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest("a, button, [data-cursor='hover']")) {
    cursor.classList.remove("hover");
  }
});

// ─────────────────────────────────────────────────────────
// Mesh background follows mouse
// ─────────────────────────────────────────────────────────
const mesh = $("#bg-mesh");
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  mesh.style.setProperty("--mx", `${x}%`);
  mesh.style.setProperty("--my", `${y}%`);
});

// ─────────────────────────────────────────────────────────
// Scroll progress bar
// ─────────────────────────────────────────────────────────
const progressBar = $("#progress-bar");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progressBar.style.width = `${pct}%`;
}, { passive: true });

// ─────────────────────────────────────────────────────────
// Section heading letter-by-letter reveal
// ─────────────────────────────────────────────────────────
$$("[data-letters]").forEach(el => {
  const text = el.textContent;
  el.innerHTML = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = char === " " ? " " : char;
    span.style.transitionDelay = `${i * 0.03}s`;
    el.appendChild(span);
  });
});

// ─────────────────────────────────────────────────────────
// IntersectionObserver — reveal on scroll
// ─────────────────────────────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

$$(".reveal, .section-head").forEach(el => io.observe(el));

// ─────────────────────────────────────────────────────────
// Number counters
// ─────────────────────────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.floor(eased * target);
    el.textContent = val.toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  }
  requestAnimationFrame(step);
}

const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

$$("[data-count]").forEach(el => counterIO.observe(el));

// ─────────────────────────────────────────────────────────
// Hero bio — typewriter "currently looking for..."
// ─────────────────────────────────────────────────────────
const typerTarget = $("#typer-target");
const typePhrases = [
  " Currently exploring machine learning from the ground up.",
  " Currently building projects I'm genuinely curious about.",
  " Currently turning ideas into working pipelines.",
  " Currently learning something new every week.",
];

async function typeLoop() {
  let i = 0;
  while (true) {
    const phrase = typePhrases[i % typePhrases.length];
    // type forward
    for (let n = 0; n <= phrase.length; n++) {
      typerTarget.textContent = phrase.slice(0, n);
      await sleep(38);
    }
    await sleep(2400);
    // delete
    for (let n = phrase.length; n >= 0; n--) {
      typerTarget.textContent = phrase.slice(0, n);
      await sleep(22);
    }
    await sleep(400);
    i++;
  }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
typeLoop();

// ─────────────────────────────────────────────────────────
// Magnetic buttons (pull toward cursor)
// ─────────────────────────────────────────────────────────
$$(".magnetic").forEach(btn => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

// ─────────────────────────────────────────────────────────
// Project cards — 3D tilt + spotlight on hover
// ─────────────────────────────────────────────────────────
function bindCardTilt(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cxPct = (x / rect.width) * 100;
    const cyPct = (y / rect.height) * 100;
    const tiltX = ((y - rect.height / 2) / rect.height) * -8;
    const tiltY = ((x - rect.width / 2) / rect.width) * 8;
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
    card.style.setProperty("--card-mx", `${cxPct}%`);
    card.style.setProperty("--card-my", `${cyPct}%`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

// ─────────────────────────────────────────────────────────
// Load projects
// ─────────────────────────────────────────────────────────
const grid = $("#projects-grid");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Project data kept in-memory after fetch so the modal can read it
let PROJECTS = [];

function renderProject(p, idx) {
  const featuredCls = p.featured ? "featured" : "";
  const badge = p.featured ? `<span class="project-badge">Flagship</span>` : "";
  const isVideo = p.image && /\.(mp4|webm|mov)$/i.test(p.image);
  const img = p.image
    ? (isVideo
        ? `<video src="${escapeHtml(p.image)}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHtml(p.title)} demo"></video>`
        : `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} preview" loading="lazy" />`)
    : `<span aria-hidden="true">${p.emoji || "📁"}</span>`;
  const tags = (p.tags || []).slice(0, 5).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  return `
    <article class="project-card reveal ${featuredCls}" data-project-index="${idx}" data-cursor="hover" style="transition-delay: ${idx * 0.1}s">
      ${badge}
      <div class="project-img">${img}</div>
      <div class="project-body">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <p class="project-tagline">${escapeHtml(p.tagline || "")}</p>
        <div class="project-tags">${tags}</div>
        <div class="project-links">
          <span style="color: var(--accent); font-weight: 500;">View details <span>↗</span></span>
        </div>
      </div>
    </article>
  `;
}

// ─────────────────────────────────────────────────────────
// Modal logic
// ─────────────────────────────────────────────────────────
const modal = $("#project-modal");
const modalContent = $("#modal-content");

function renderModalContent(p) {
  const tags = (p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const highlights = (p.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join("");
  const metrics = (p.metrics || []).map(m => `
    <div class="metric-card">
      <span class="metric-value">${escapeHtml(m.value)}</span>
      <span class="metric-label">${escapeHtml(m.label)}</span>
    </div>
  `).join("");

  const meta = [];
  if (p.year) meta.push(`<span>${escapeHtml(p.year)}</span>`);
  if (p.role) meta.push(`<span class="dot">·</span><span>${escapeHtml(p.role)}</span>`);

  const actions = [];
  if (p.links?.demo) actions.push(`<a href="${escapeHtml(p.links.demo)}" target="_blank" rel="noopener" class="btn primary magnetic" data-cursor="hover">View live <span class="arrow">→</span></a>`);
  if (p.links?.code) actions.push(`<a href="${escapeHtml(p.links.code)}" target="_blank" rel="noopener" class="btn magnetic" data-cursor="hover">Source code</a>`);

  const modalIsVideo = p.image && /\.(mp4|webm|mov)$/i.test(p.image);
  const modalMedia = p.image
    ? (modalIsVideo
        ? `<div class="modal-media"><video src="${escapeHtml(p.image)}" autoplay muted loop playsinline controls preload="metadata"></video></div>`
        : `<div class="modal-media"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" /></div>`)
    : "";

  return `
    ${modalMedia}
    <div class="modal-hero">
      <div class="modal-emoji">${p.emoji || "📁"}</div>
      <div class="modal-title-block">
        <div class="modal-meta">${meta.join("")}</div>
        <h2 class="modal-title">${escapeHtml(p.title)}</h2>
        <p class="modal-tagline">${escapeHtml(p.tagline || "")}</p>
      </div>
    </div>

    ${p.details ? `
      <div class="modal-section">
        <h4>About</h4>
        <p>${escapeHtml(p.details)}</p>
      </div>
    ` : ""}

    ${metrics ? `
      <div class="modal-section">
        <h4>Key results</h4>
        <div class="modal-metrics">${metrics}</div>
      </div>
    ` : ""}

    ${highlights ? `
      <div class="modal-section">
        <h4>Highlights</h4>
        <ul class="modal-highlights">${highlights}</ul>
      </div>
    ` : ""}

    ${p.learnings ? `
      <div class="modal-section">
        <h4>What I learned</h4>
        <p>${escapeHtml(p.learnings)}</p>
      </div>
    ` : ""}

    <div class="modal-section">
      <h4>Stack</h4>
      <div class="modal-tags">${tags}</div>
    </div>

    ${actions.length ? `<div class="modal-actions">${actions.join("")}</div>` : ""}
  `;
}

function openProjectModal(idx) {
  const p = PROJECTS[idx];
  if (!p) return;
  modalContent.innerHTML = renderModalContent(p);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  // Re-bind magnetic effect for newly inserted buttons
  $$(".modal .magnetic").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

function closeProjectModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

// Backdrop + close-button click
modal.addEventListener("click", (e) => {
  if (e.target.dataset.close !== undefined || e.target.closest("[data-close]")) {
    closeProjectModal();
  }
});

// Esc to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) {
    closeProjectModal();
  }
});

async function loadProjects() {
  try {
    const resp = await fetch("projects.json");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    PROJECTS = await resp.json();
    grid.innerHTML = PROJECTS.map(renderProject).join("");

    // wire up: tilt, reveal observer, click-to-open
    $$(".project-card").forEach(card => {
      bindCardTilt(card);
      io.observe(card);
      card.addEventListener("click", () => {
        const idx = parseInt(card.dataset.projectIndex, 10);
        openProjectModal(idx);
      });
    });
  } catch (err) {
    grid.innerHTML = `<p class="muted">Could not load projects.json: ${escapeHtml(err.message)}</p>`;
  }
}

loadProjects();

// ─────────────────────────────────────────────────────────
// Scroll spy — active section in nav + side rail + banner
// ─────────────────────────────────────────────────────────
const SECTION_LABELS = {
  top: { num: "00", name: "Home" },
  about: { num: "01", name: "About" },
  projects: { num: "02", name: "Projects" },
  experience: { num: "03", name: "Experience" },
  skills: { num: "04", name: "Skills" },
  certifications: { num: "05", name: "Certifications" },
  contact: { num: "06", name: "Contact" },
};

const railDots = $$(".rail-dot");
const navLinks = $$(".nav-links a[data-section]");
const banner = $("#section-banner");
const bannerNum = $("#section-banner-num");
const bannerName = $("#section-banner-name");

// Build section list with their elements
const sectionIds = ["top", "about", "projects", "experience", "skills", "certifications", "contact"];
const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

function setActiveSection(id) {
  // Update side rail
  railDots.forEach(dot => {
    dot.classList.toggle("active", dot.dataset.section === id);
  });
  // Update top nav
  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.section === id);
  });
  // Update floating banner
  const meta = SECTION_LABELS[id];
  if (meta && bannerNum && bannerName) {
    bannerNum.textContent = meta.num;
    bannerName.textContent = meta.name;
  }
}

// Toggle "scrolled" class on body once user scrolls past hero
const scrollThreshold = 200;
window.addEventListener("scroll", () => {
  if (window.scrollY > scrollThreshold) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
}, { passive: true });

// Use IntersectionObserver to detect which section is most in view
const sectionObserver = new IntersectionObserver((entries) => {
  // Find the entry with the largest intersection ratio that's currently intersecting
  let bestEntry = null;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
        bestEntry = entry;
      }
    }
  });
  if (bestEntry) {
    setActiveSection(bestEntry.target.id);
  }
}, {
  // Trigger when section is roughly centered vertically
  rootMargin: "-30% 0px -50% 0px",
  threshold: [0, 0.25, 0.5, 0.75, 1],
});

sectionEls.forEach(el => sectionObserver.observe(el));

// Default: highlight Home at load
setActiveSection("top");
