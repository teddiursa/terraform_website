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



// Slideshow Functionality
let slideIndex = 1;
let home_slideIndex = 1;

function initSlideshows() {
  // Projects slideshow
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("demo");
  const captionText = document.getElementById("caption");

  console.log("Projects slideshow - Slides found:", slides.length);
  console.log("Projects slideshow - Dots found:", dots.length);

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

  console.log("Home slideshow - Slides found:", homeSlides.length);
  console.log("Home slideshow - Dots found:", homeDots.length);

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
    slides[i].classList.remove("active");
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[slideIndex - 1].classList.add("active");
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
    slides[i].classList.remove("active");
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[home_slideIndex - 1].classList.add("active");
  slides[home_slideIndex - 1].style.display = "block";
  dots[home_slideIndex - 1].classList.add("active");

  if (captionText && dots[home_slideIndex - 1]) {
    captionText.innerHTML = dots[home_slideIndex - 1].alt;
  }
}

// Simple Image Modal for Viewing Details
function initImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const slidesImages = document.querySelectorAll('.home_Slides img, .mySlides img, .project-card img, .experience-card img');
  const navLinks = document.querySelectorAll('.nav-link');

  console.log("Image modal - Images found:", slidesImages.length);

  slidesImages.forEach((img, index) => {
    console.log(`Image ${index}:`, img.src);

    // Click to open modal
    img.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      console.log('Opening modal for image:', this.src);

      // Set modal image source
      modalImage.src = this.src;
      modalImage.alt = this.alt || 'Enlarged view';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('.home_prev, .home_next, .prev, .next').forEach(a => a.style.display = 'none');
    });

    // Check if image loaded
    img.addEventListener('load', function() {
      console.log(`Image loaded: ${this.src}`);
    });

    img.addEventListener('error', function() {
      console.error(`Image failed to load: ${this.src}`);
    });
  });

  // Close modal when clicking anywhere
    modal.addEventListener('click', function() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalImage.src = '';
    document.querySelectorAll('.home_prev, .home_next, .prev, .next').forEach(a => a.style.display = '');
});

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalImage.src = '';
        document.querySelectorAll('.home_prev, .home_next, .prev, .next').forEach(a => a.style.display = '');
    }
    
    // Arrow key navigation when modal is open
    if (modal.classList.contains('active')) {
      const activeSection = document.querySelector('.section-content.active-section');
      if (!activeSection) return;
      
      // Only navigate slides if the current image is part of a slideshow
      const currentSrc = modalImage.src;
      let isSlideshow = false;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (activeSection.id === 'projects') {
          // Check if current image is in mySlides
          const slides = document.getElementsByClassName("mySlides");
          for (let i = 0; i < slides.length; i++) {
            const img = slides[i].querySelector('img');
            if (img && img.src === currentSrc) {
              isSlideshow = true;
              slideIndex = i + 1;
              break;
            }
          }
          if (isSlideshow) {
            plusSlides(-1);
            const newImg = slides[slideIndex - 1].querySelector('img');
            if (newImg) modalImage.src = newImg.src;
          }
        } else if (activeSection.id === 'home') {
          // Check if current image is in home_Slides
          const homeSlides = document.getElementsByClassName("home_Slides");
          for (let i = 0; i < homeSlides.length; i++) {
            const img = homeSlides[i].querySelector('img');
            if (img && img.src === currentSrc) {
              isSlideshow = true;
              home_slideIndex = i + 1;
              break;
            }
          }
          if (isSlideshow) {
            home_plusSlides(-1);
            const newImg = homeSlides[home_slideIndex - 1].querySelector('img');
            if (newImg) modalImage.src = newImg.src;
          }
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (activeSection.id === 'projects') {
          // Check if current image is in mySlides
          const slides = document.getElementsByClassName("mySlides");
          for (let i = 0; i < slides.length; i++) {
            const img = slides[i].querySelector('img');
            if (img && img.src === currentSrc) {
              isSlideshow = true;
              slideIndex = i + 1;
              break;
            }
          }
          if (isSlideshow) {
            plusSlides(1);
            const newImg = slides[slideIndex - 1].querySelector('img');
            if (newImg) modalImage.src = newImg.src;
          }
        } else if (activeSection.id === 'home') {
          // Check if current image is in home_Slides
          const homeSlides = document.getElementsByClassName("home_Slides");
          for (let i = 0; i < homeSlides.length; i++) {
            const img = homeSlides[i].querySelector('img');
            if (img && img.src === currentSrc) {
              isSlideshow = true;
              home_slideIndex = i + 1;
              break;
            }
          }
          if (isSlideshow) {
            home_plusSlides(1);
            const newImg = homeSlides[home_slideIndex - 1].querySelector('img');
            if (newImg) modalImage.src = newImg.src;
          }
        }
      }
    }
});

  // Close modal when clicking tabs
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                modalImage.src = '';
                document.querySelectorAll('.home_prev, .home_next, .prev, .next').forEach(a => a.style.display = '');
            }
    });
  });
}

// Swipe detection for mobile
let touchStartX = 0;
let touchEndX = 0;

function initSwipe() {
  document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const activeSection = document.querySelector('.section-content.active-section');
  if (!activeSection) return;

  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) < swipeThreshold) return;

  if (activeSection.id === 'projects') {
    if (diff > 0) {
      plusSlides(1);
    } else {
      plusSlides(-1);
    }
    // Update modal image if modal is open
    if (modal && modal.classList.contains('active')) {
      const slides = document.getElementsByClassName("mySlides");
      if (slides.length > 0) {
        const newImg = slides[slideIndex - 1].querySelector('img');
        if (newImg) modalImage.src = newImg.src;
      }
    }
  } else if (activeSection.id === 'home') {
    if (diff > 0) {
      home_plusSlides(1);
    } else {
      home_plusSlides(-1);
    }
    // Update modal image if modal is open
    if (modal && modal.classList.contains('active')) {
      const homeSlides = document.getElementsByClassName("home_Slides");
      if (homeSlides.length > 0) {
        const newImg = homeSlides[home_slideIndex - 1].querySelector('img');
        if (newImg) modalImage.src = newImg.src;
      }
    }
  }
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  // Initialize navigation
  handleNavigation();

  // Initialize visitor counter
  initVisitorCounter();

  // Initialize slideshows
  initSlideshows();

  // Initialize image modal
  initImageModal();

  // Initialize swipe detection
  initSwipe();

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

  // Add keyboard navigation for slideshows
  document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('imageModal');
    if (modal && modal.classList.contains('active')) {
      // Modal is open - don't handle arrow keys
      return;
    }

    // Check if we're in projects or home section
    const activeSection = document.querySelector('.section-content.active-section');
    if (!activeSection) return;

    // Handle arrow keys for slideshow navigation
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (activeSection.id === 'projects') {
        plusSlides(-1);
      } else if (activeSection.id === 'home') {
        home_plusSlides(-1);
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (activeSection.id === 'projects') {
        plusSlides(1);
      } else if (activeSection.id === 'home') {
        home_plusSlides(1);
      }
    }
  });
});