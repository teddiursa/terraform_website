// Navigation and Section Management
function handleNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section-content');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Get target section
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      // Update active states
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Hide all sections first
      sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-section');
      });

      // Show target section
      if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');

        // Scroll to top of page
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }

      // Close mobile menu if open
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
}

// Suffix only, so the caller can keep it off the tabular-nums run.
function ordinalSuffix(i) {
  const j = i % 10;
  const k = i % 100;
  if (j == 1 && k != 11) {
    return "st";
  }
  if (j == 2 && k != 12) {
    return "nd";
  }
  if (j == 3 && k != 13) {
    return "rd";
  }
  return "th";
}

// Constants for conversion from seconds
const weekSeconds = 604800;
const daySeconds = 86400;
const hourSeconds = 3600;
const minuteSeconds = 60;

/* Converts seconds to weeks, days, hours, and minutes
   Ensures use of plural or singular as necessary
*/
function secondsToWeeks(input) {
  let time = input;
  let output = "";

  if (Math.trunc(time / weekSeconds) != 0) {
    output += Math.trunc(time / weekSeconds);
    if (Math.trunc(time / weekSeconds) > 1) output += " weeks";
    else output += " week";
    time = time % weekSeconds;
  }
  if (Math.trunc(time / daySeconds) != 0) {
    if (output != null) output += " ";
    output += Math.trunc(time / daySeconds);
    if (Math.trunc(time / daySeconds) > 1) output += " days";
    else output += " day";
    time = time % daySeconds;
  }
  if (Math.trunc(time / hourSeconds) != 0) {
    if (output != null) output += " ";
    output += Math.trunc(time / hourSeconds);
    if (Math.trunc(time / hourSeconds) > 1) output += " hours";
    else output += " hour";
    time = time % hourSeconds;
  }
  if (Math.trunc(time / minuteSeconds) != 0) {
    if (output != null) output += " ";
    output += Math.trunc(time / minuteSeconds);
    if (Math.trunc(time / minuteSeconds) > 1) output += " minutes";
    else output += " minute";
    time = time % minuteSeconds;
  }
  if (time >= 1) {
    if (output !== "") output += " and ";
    output += Math.trunc(time);
    if (Math.trunc(time) > 1) output += " seconds";
    else output += " second";
  } else if (output === "") {
    output += "less than a second";
  }
  return output;
}

// Visitor Counter. Renders into the masthead chip beside the brand.
// Built from DOM nodes rather than an innerHTML string so the markup keeps
// its own styling once the fetch resolves.
function initVisitorCounter() {
  const host = document.getElementById("counterID");
  if (!host) return;

  function span(cls, text) {
    const n = document.createElement("span");
    n.className = cls;
    n.textContent = text;
    return n;
  }

  // Empty until the calls resolve; a "Loading" string in the masthead is
  // wider than the result it replaces.
  host.textContent = "";

  fetch("https://s3.amazonaws.com/gregchow.jsonbucket/links.json")
    .then((r) => {
      if (!r.ok) throw new Error("Network response was not ok");
      return r.json();
    })
    .then((links) =>
      Promise.all([links.urlCount, links.urlTime].map((u) =>
        fetch(u).then((r) => {
          if (!r.ok) throw new Error("Network response was not ok");
          return r.json();
        })
      ))
    )
    .then(([count, time]) => {
      // One compact line; trailing words drop out at narrow widths.
      const n = span("visit-count", Number(count.Count).toLocaleString());
      n.appendChild(span("visit-ord", ordinalSuffix(count.Count)));

      host.replaceChildren(
        n,
        span("visit-label", "visitor"),
        span("visit-since", "· last visit " + secondsToWeeks(time.Time) + " ago")
      );
    })
    .catch((error) => {
      // Left empty; a failure message in the masthead is worse than nothing.
      console.error("Error:", error);
      host.textContent = "";
    });
}

/* ---------------------------------------------------------------- lightbox
 *
 * One overlay shared by the gallery and the project screenshots. It owns the
 * open/close state so nothing else has to reach in and toggle it.
 */
const lightbox = (function () {
  let el = null, img = null, restore = null;

  function nodes() {
    if (!el) {
      el = document.getElementById("imageModal");
      img = document.getElementById("modalImage");
    }
    return el && img;
  }

  /* Rides on a class, not a [src$=".svg"] selector: the preview build
   * inlines images as data URIs, which no suffix selector can match. */
  function setSrc(src, alt) {
    img.src = src;
    img.alt = alt || "Enlarged view";
    img.classList.toggle("is-raster", !/^data:image\/svg|\.svg(\?|#|$)/i.test(src));
  }

  function open(src, alt, onKey) {
    if (!nodes()) return;
    setSrc(src, alt);
    el.classList.add("active");
    document.body.style.overflow = "hidden";
    restore = onKey || null;
  }

  function close() {
    if (!nodes()) return;
    el.classList.remove("active");
    document.body.style.overflow = "";
    img.src = "";
    restore = null;
  }

  function isOpen() { return nodes() && el.classList.contains("active"); }
  function swap(src, alt) { if (isOpen()) setSrc(src, alt); }

  document.addEventListener("click", function (e) {
    if (isOpen() && el.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    if (e.key === "Escape") { close(); return; }
    if (restore && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      restore(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  return { open: open, close: close, isOpen: isOpen, swap: swap };
})();

/* Project-card and experience images open in the same overlay. */
function initCardImages() {
  document.querySelectorAll(".project-card img, .experience-card img, .shots-grid img").forEach((img) => {
    // Cards render ~200px tall, too small for a diagram carrying addressing.
    img.addEventListener("click", () => lightbox.open(img.src, img.alt));
  });
}

/* Horizontal swipe on touch devices. 45px threshold, and vertical movement
 * has to stay smaller than horizontal or a scroll would register as a swipe. */
function addSwipe(el, step) {
  if (!el) return;
  let x0 = null, y0 = null;
  el.addEventListener("touchstart", function (e) {
    x0 = e.changedTouches[0].clientX;
    y0 = e.changedTouches[0].clientY;
  }, { passive: true });
  el.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    x0 = y0 = null;
  }, { passive: true });
}

/* -------------------------------------------------------------------- boot
 *
 * Each step is isolated. Previously all of these ran in one callback, so a
 * single throw silently took out every step after it - the failure mode is
 * invisible, because what you see is a control that simply does nothing.
 */
document.addEventListener("DOMContentLoaded", function () {
  [["navigation", handleNavigation],
   ["visitor counter", initVisitorCounter],
   ["card images", initCardImages]].forEach(function (step) {
    try {
      step[1]();
    } catch (err) {
      console.error("init failed:", step[0], err);
    }
  });

  const home = document.getElementById("home");
  const homeLink = document.querySelector('a[href="#home"]');
  document.querySelectorAll(".section-content").forEach((s) => {
    s.style.display = "none";
    s.classList.remove("active-section");
  });
  if (home) {
    home.style.display = "block";
    home.classList.add("active-section");
  }
  if (homeLink) homeLink.classList.add("active");
});
