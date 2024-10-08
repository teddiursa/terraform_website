// Menu buttons
function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}

// Add number suffix to value
function ordinalSuffix(i) {
  // j is last digit and k is last 2 digits
  var j = i % 10,
    k = i % 100;
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
  time = input;
  // Create empty string output
  let output = "";
  if (Math.trunc(time / weekSeconds) != 0) {
    output += Math.trunc(time / weekSeconds);
    if (Math.trunc(time / weekSeconds) > 1) output += " weeks";
    else output += " week";
    // Reduce time for next type
    time = time % weekSeconds;
  }
  if (Math.trunc(time / daySeconds) != 0) {
    // Prepend space if output exists
    if (output != null) output += " ";
    output += Math.trunc(time / daySeconds);
    if (Math.trunc(time / daySeconds) > 1) output += " days";
    else output += " day";
    time = time % daySeconds;
  }
  if (Math.trunc(time / hourSeconds) != 0) {
    // Prepend space if output exists
    if (output != null) output += " ";
    output += Math.trunc(time / hourSeconds);
    if (Math.trunc(time / hourSeconds) > 1) output += " hours";
    else output += " hour";
    // Reduce time for next type
    time = time % hourSeconds;
  }
  if (Math.trunc(time / minuteSeconds) != 0) {
    // Prepend space if output exists
    if (output != null) output += " ";
    output += Math.trunc(time / minuteSeconds);
    if (Math.trunc(time / minuteSeconds) > 1) output += " minutes";
    else output += " minute";
    // Reduce time for next type
    time = time % minuteSeconds;
  }
  if (time >= 1) {
    // Prepend space if output exists
    if (output != "") output += " and ";
    output += Math.trunc(time);
    if (Math.trunc(time) > 1) output += " seconds";
    else output += " second";
  }
  // For when value is less than a second
  else if (output == "") {
    output += "less than a second";
  }
  return output;
}

// variables for JSON url data
let urlCount = "";
let urlTime = "";
let counter = '<h2>You are the <span style="color:#67B868">';

// Fetch JSON data containing urls, then fetch data from urls
fetch("https://s3.amazonaws.com/gregchow.jsonbucket/links.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    // Stores json urls into variables
    urlCount = data.urlCount;
    urlTime = data.urlTime;

    // Increment loading text
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

    // Increment loading text
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
    // Increment loading text
    document.getElementById("counterID").innerHTML = "<h2>Loading...</h2>";
    counter +=
      secondsToWeeks(data.Time) +
      "</span> ago</h2><h5>Created with AWS Lambda and DynamoDB</h5>";
    //display block after loading
    document.getElementById("counterID").innerHTML = counter;
  })
  .catch((error) => console.error("Error:", error));

// Function to iterate unix timer
setInterval(function () {
  document.getElementById("unixTime").innerText = Math.floor(Date.now() / 1000);
}, 1000);

// Define the slideIndex variable globally
let slideIndex = 1;
let home_slideIndex = 1;

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", (event) => {
  // Attach event listeners to the prev and next buttons
  document.querySelector(".prev").addEventListener("click", () => {
    plusSlides(-1);
  });
  document.querySelector(".next").addEventListener("click", () => {
    plusSlides(1);
  });
  // Attach event listeners to home prev and next buttons
  document.querySelector(".home_prev").addEventListener("click", () => {
    home_plusSlides(-1);
  });
  document.querySelector(".home_next").addEventListener("click", () => {
    home_plusSlides(1);
  });

  // Attach event listeners to each dot
  document.querySelectorAll(".demo").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide(index + 1);
    });
  });

  // Attach event listeners to each home dot
  document.querySelectorAll(".home_demo").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      home_currentSlide(index + 1);
    });
  });

  // Define the plusSlides function
  function plusSlides(n) {
    showSlides((slideIndex += n));
  }
  function home_plusSlides(n) {
    home_showSlides((home_slideIndex += n));
  }

  // Define the currentSlide function
  function currentSlide(n) {
    showSlides((slideIndex = n));
  }
  function home_currentSlide(n) {
    home_showSlides((home_slideIndex = n));
  }

  // Define the showSlides function
  function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("demo");
    let captionText = document.getElementById("caption");
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
      dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
    captionText.innerHTML = dots[slideIndex - 1].alt;
  }

  // Call showSlides to display the first slide
  showSlides(slideIndex);

  // Define the showSlides function
  function home_showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("home_Slides");
    let dots = document.getElementsByClassName("home_demo");
    let captionText = document.getElementById("home_caption");
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
      dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[home_slideIndex - 1].style.display = "block";
    dots[home_slideIndex - 1].className += " active";
    captionText.innerHTML = dots[home_slideIndex - 1].alt;
  }

// Call showSlides to display the first slide
  home_showSlides(home_slideIndex);
});

document.addEventListener('DOMContentLoaded', function() {
  const slidesImages = document.querySelectorAll('.home_Slides img');

  slidesImages.forEach(img => {
      img.addEventListener('click', function(event) {
          this.classList.toggle('zoomed');
          event.stopPropagation(); // Prevent the click from bubbling up to the document
      });
  });

  document.addEventListener('click', function(event) {
      slidesImages.forEach(img => {
          if (img.classList.contains('zoomed')) {
              img.classList.remove('zoomed');
          }
      });
  });
});

