// The status API gateway URL changes on every Terraform deployment, so it is
// read from the JSON file Terraform writes rather than hardcoded here - the
// same approach home.js uses for the visitor count and time APIs.
const urlLinks = "https://s3.amazonaws.com/gregchow.jsonbucket/links.json";

// Fetch JSON data containing urls, then fetch the status from that url
fetch(urlLinks)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((links) => {
    if (!links.urlStatus) {
      throw new Error('urlStatus missing from links.json');
    }
    return fetch(links.urlStatus);
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // Update status HTML
    const statusElement = document.getElementById("status");
    if (statusElement) {
      if (data.Status == 'Up') {
        statusElement.innerHTML = 'GregChow.net is currently <span class="status-up">up</span>';
      } else {
        statusElement.innerHTML = 'GregChow.net is currently <span class="status-down">down</span>';
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    const statusElement = document.getElementById("status");
    if (statusElement) {
      statusElement.innerHTML = 'Unable to check status. Please try again later.';
      statusElement.classList.add('status-down');
    }
  });
