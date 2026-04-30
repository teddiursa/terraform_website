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

// Add number suffix to value
function ordinalSuffix(i) {
  const j = i % 10;
  const k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
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

// Visitor Counter Functionality
function initVisitorCounter() {
  let urlCount = "";
  let urlTime = "";
  let counter = '<h2>You are the <span style="color:#67B868">';

  fetch("https://s3.amazonaws.com/gregchow.jsonbucket/links.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      urlCount = data.urlCount;
      urlTime = data.urlTime;

      document.getElementById("counterID").innerHTML = "<h2>Loading.</h2>";

      return fetch(urlCount);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      counter +=
        ordinalSuffix(data.Count) +
        '</span> visitor!</h2><h2>The last visitor was <span style="color:#67B868">';

      document.getElementById("counterID").innerHTML = "<h2>Loading..</h2>";
      return fetch(urlTime);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("counterID").innerHTML = "<h2>Loading...</h2>";
      counter +=
        secondsToWeeks(data.Time) +
        "</span> ago</h2><h5>Created with AWS Lambda and DynamoDB</h5>";
      document.getElementById("counterID").innerHTML = counter;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("counterID").innerHTML = "<h2>Unable to load visitor count</h2>";
    });
}

// Unix Timer
function initUnixTimer() {
  setInterval(function () {
    const unixTimeElement = document.getElementById("unixTime");
    if (unixTimeElement) {
      unixTimeElement.innerText = Math.floor(Date.now() / 1000);
    }
  }, 1000);
}

// Slideshow Functionality
let slideIndex = 1;
let home_slideIndex = 1;

function initSlideshows() {
  // Projects slideshow
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("demo");
  const captionText = document.getElementById("caption");

  if (slides.length > 0) {
    showSlides(slideIndex);

    // Next/previous buttons
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    if (prevBtn) prevBtn.addEventListener("click", () => plusSlides(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => plusSlides(1));

    // Thumbnail clicks
    Array.from(dots).forEach((dot, index) => {
      dot.addEventListener("click", () => currentSlide(index + 1));
    });
  }

  // Home slideshow
  const homeSlides = document.getElementsByClassName("home_Slides");
  const homeDots = document.getElementsByClassName("home_demo");
  const homeCaptionText = document.getElementById("home_caption");

  if (homeSlides.length > 0) {
    home_showSlides(home_slideIndex);

    // Next/previous buttons
    const homePrevBtn = document.querySelector(".home_prev");
    const homeNextBtn = document.querySelector(".home_next");

    if (homePrevBtn) homePrevBtn.addEventListener("click", () => home_plusSlides(-1));
    if (homeNextBtn) homeNextBtn.addEventListener("click", () => home_plusSlides(1));

    // Thumbnail clicks
    Array.from(homeDots).forEach((dot, index) => {
      dot.addEventListener("click", () => home_currentSlide(index + 1));
    });
  }
}

function plusSlides(n) {
  showSlides((slideIndex += n));
}

function home_plusSlides(n) {
  home_showSlides((home_slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function home_currentSlide(n) {
  home_showSlides((home_slideIndex = n));
}

function showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("demo");
  const captionText = document.getElementById("caption");

  if (slides.length === 0) return;

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].classList.add("active");

  if (captionText && dots[slideIndex - 1]) {
    captionText.innerHTML = dots[slideIndex - 1].alt;
  }
}

function home_showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("home_Slides");
  const dots = document.getElementsByClassName("home_demo");
  const captionText = document.getElementById("home_caption");

  if (slides.length === 0) return;

  if (n > slides.length) {
    home_slideIndex = 1;
  }
  if (n < 1) {
    home_slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[home_slideIndex - 1].style.display = "block";
  dots[home_slideIndex - 1].classList.add("active");

  if (captionText && dots[home_slideIndex - 1]) {
    captionText.innerHTML = dots[home_slideIndex - 1].alt;
  }
}

// Enhanced Image Zoom Functionality
function initImageZoom() {
  const slidesImages = document.querySelectorAll('.home_Slides img, .mySlides img');

  slidesImages.forEach(img => {
    // Click to zoom
    img.addEventListener('click', function(event) {
      event.stopPropagation();
      this.classList.toggle('zoomed');

      // Add overlay when zoomed
      if (this.classList.contains('zoomed')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Touch support for mobile
    img.addEventListener('touchstart', function(event) {
      // Prevent default touch behavior
      // event.preventDefault();
    }, { passive: true });
  });

  // Click outside to close zoom
  document.addEventListener('click', function(event) {
    const zoomedImages = document.querySelectorAll('.home_Slides img.zoomed, .mySlides img.zoomed');
    zoomedImages.forEach(img => {
      if (!img.contains(event.target)) {
        img.classList.remove('zoomed');
        document.body.style.overflow = '';
      }
    });
  });

  // Keyboard support - ESC to close zoom
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const zoomedImages = document.querySelectorAll('.home_Slides img.zoomed, .mySlides img.zoomed');
      zoomedImages.forEach(img => {
        img.classList.remove('zoomed');
        document.body.style.overflow = '';
      });
    }
  });
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  // Initialize navigation
  handleNavigation();

  // Initialize visitor counter
  initVisitorCounter();

  // Initialize unix timer
  initUnixTimer();

  // Initialize slideshows
  initSlideshows();

  // Initialize image zoom
  initImageZoom();

  // Set home section as active by default
  const homeSection = document.getElementById('home');
  const homeLink = document.querySelector('a[href="#home"]');
  const allSections = document.querySelectorAll('.section-content');

  // Hide all sections first
  allSections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active-section');
  });

  // Show home section
  if (homeSection && homeLink) {
    homeSection.style.display = 'block';
    homeSection.classList.add('active-section');
    homeLink.classList.add('active');
  }
});