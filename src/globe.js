import createGlobe from "../vendor/cobe.module.js";

// 15 event locations. cobe markers use [lat, lon]; each needs a unique id so
// cobe emits the --cobe-<id> CSS anchor + --cobe-visible-<id> variable.
const LOCATIONS = [
  { id: "bahamas", name: "Bahamas", location: [25.06, -77.35], img: "event1.png", desc: "President's Club incentive retreat", rotate: -5 },
  { id: "melbourne", name: "Melbourne", location: [-37.81, 144.96], img: "event2.png", desc: "Global partner summit", rotate: 4 },
  { id: "kl", name: "Kuala Lumpur", location: [3.14, 101.69], img: "event3.png", desc: "Regional brand activation", rotate: -3 },
  { id: "srilanka", name: "Sri Lanka", location: [6.93, 79.86], img: "event4.png", desc: "Annual leadership offsite", rotate: 5 },
  { id: "delhi", name: "Delhi", location: [28.61, 77.21], img: "event5.png", desc: "Flagship product launch gala", rotate: -4 },
  { id: "calcutta", name: "Calcutta", location: [22.57, 88.36], img: "event6.png", desc: "Cultural night & awards", rotate: 3 },
  { id: "mumbai", name: "Mumbai", location: [19.08, 72.88], img: "event7.png", desc: "Investor & founders dinner", rotate: -6 },
  { id: "jaipur", name: "Jaipur", location: [26.91, 75.79], img: "event8.png", desc: "Heritage gala evening", rotate: 5 },
  { id: "chennai", name: "Chennai", location: [13.08, 80.27], img: "event1.png", desc: "Tech conference keynote", rotate: -3 },
  { id: "bangalore", name: "Bangalore", location: [12.97, 77.59], img: "event2.png", desc: "Innovation expo showcase", rotate: 4 },
  { id: "hyderabad", name: "Hyderabad", location: [17.39, 78.49], img: "event3.png", desc: "Sales kickoff celebration", rotate: -5 },
  { id: "dubai", name: "Dubai", location: [25.2, 55.27], img: "event4.png", desc: "Luxury brand launch", rotate: 3 },
  { id: "oman", name: "Oman", location: [23.59, 58.41], img: "event5.png", desc: "Desert gala experience", rotate: -4 },
  { id: "egypt", name: "Egypt", location: [30.04, 31.24], img: "event6.png", desc: "Anniversary celebration", rotate: 6 },
  { id: "italy", name: "Italy", location: [41.9, 12.5], img: "event7.png", desc: "European leadership summit", rotate: -3 },
];

const wrap = document.querySelector("#globe-wrap");
const canvas = document.querySelector("#globe-canvas");

// --- Event card modal -------------------------------------------------------
const eventModal = document.querySelector(".event-modal");
const eventPhoto = eventModal.querySelector(".event-photo");
const eventName = eventModal.querySelector(".event-name");
const eventDesc = eventModal.querySelector(".event-desc");

function openEventCard(loc) {
  eventPhoto.src = "./assets/" + loc.img;
  eventName.textContent = loc.name;
  eventDesc.textContent = loc.desc;
  eventModal.classList.add("open");
  eventModal.setAttribute("aria-hidden", "false");
}
function closeEventCard() {
  eventModal.classList.remove("open");
  eventModal.setAttribute("aria-hidden", "true");
}
eventModal.querySelector(".event-close").addEventListener("click", closeEventCard);
eventModal.querySelector(".event-backdrop").addEventListener("click", closeEventCard);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEventCard();
});

// --- Polaroid cards (anchored to cobe markers via CSS anchor positioning) ---
const rootStyle = getComputedStyle(document.documentElement);
const polaroids = [];

for (const loc of LOCATIONS) {
  const el = document.createElement("div");
  el.className = "cobe-polaroid";
  el.style.positionAnchor = `--cobe-${loc.id}`;
  el.style.bottom = "anchor(top)";
  el.style.left = "anchor(center)";
  el.style.translate = "-50% 0";
  el.style.transform = `rotate(${loc.rotate}deg)`;
  el.style.opacity = `var(--cobe-visible-${loc.id}, 0)`;
  el.style.filter = `blur(calc((1 - var(--cobe-visible-${loc.id}, 0)) * 8px))`;

  const img = document.createElement("img");
  img.src = "./assets/" + loc.img;
  img.alt = loc.name;
  const cap = document.createElement("span");
  cap.className = "cap";
  cap.textContent = loc.name;
  el.append(img, cap);
  el.addEventListener("click", () => openEventCard(loc));

  wrap.appendChild(el);
  polaroids.push({ loc, el });
}

// --- cobe globe -------------------------------------------------------------
let phi = 0;
let width = 0;
let paused = false;
const pointerStart = { x: 0, y: 0, active: false };
const dragOffset = { phi: 0, theta: 0 };
let phiOffset = 0;
let thetaOffset = 0;
let globe = null;
let raf = 0;

function startGlobe() {
  width = canvas.offsetWidth;
  if (!width || globe) return;

  globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width,
    height: width,
    phi: 0,
    theta: 0.2,
    dark: 0,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 5,
    baseColor: [1, 1, 1],
    markerColor: [0.18, 0.42, 1.0],
    glowColor: [0.86, 0.9, 0.98],
    markerElevation: 0,
    markers: LOCATIONS.map((l) => ({ location: l.location, size: 0.045, id: l.id })),
    arcs: [],
    arcColor: [0.5, 0.7, 1],
    arcWidth: 0.5,
    arcHeight: 0.25,
    opacity: 1,
  });

  function frame() {
    if (!paused) phi += 0.0035;
    globe.update({
      phi: phi + phiOffset + dragOffset.phi,
      theta: 0.2 + thetaOffset + dragOffset.theta,
    });
    for (const p of polaroids) {
      const vis = rootStyle.getPropertyValue(`--cobe-visible-${p.loc.id}`).trim();
      p.el.style.pointerEvents = vis ? "auto" : "none";
    }
    raf = requestAnimationFrame(frame);
  }
  frame();
  requestAnimationFrame(() => (canvas.style.opacity = "1"));
}

// Drag to spin (locks current rotation on release).
canvas.addEventListener("pointerdown", (e) => {
  pointerStart.x = e.clientX;
  pointerStart.y = e.clientY;
  pointerStart.active = true;
  canvas.style.cursor = "grabbing";
  paused = true;
});
window.addEventListener("pointerup", () => {
  if (pointerStart.active) {
    phiOffset += dragOffset.phi;
    thetaOffset += dragOffset.theta;
    dragOffset.phi = 0;
    dragOffset.theta = 0;
  }
  pointerStart.active = false;
  canvas.style.cursor = "grab";
  paused = false;
}, { passive: true });
window.addEventListener("pointermove", (e) => {
  if (!pointerStart.active) return;
  dragOffset.phi = (e.clientX - pointerStart.x) / 300;
  dragOffset.theta = (e.clientY - pointerStart.y) / 1000;
}, { passive: true });

let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!globe) return;
    cancelAnimationFrame(raf);
    globe.destroy();
    globe = null;
    canvas.style.opacity = "0";
    startGlobe();
  }, 200);
});

if (canvas.offsetWidth > 0) {
  startGlobe();
} else {
  const ro = new ResizeObserver((entries) => {
    if (entries[0]?.contentRect.width > 0) {
      ro.disconnect();
      startGlobe();
    }
  });
  ro.observe(canvas);
}
