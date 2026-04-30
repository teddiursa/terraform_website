// Variable for JSON url data
let urlStatus = "https://b96tmqfgoi.execute-api.us-east-1.amazonaws.com/statusStage";

// Fetch JSON data containing urls, then fetch data from url
fetch(urlStatus)
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
