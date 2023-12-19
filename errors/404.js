// Variable for JSON url data
let urlStatus = "";

// Fetch JSON data containing urls, then fetch data from url
fetch('https://s3.amazonaws.com/gregchow.jsonbucket/links.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Stores json url into variables
    urlStatus = data.urlStatus;

    // Call function to get website status
    return fetch(urlStatus); 
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // Update status HTML
    if (data.Status == 'Up') {
        document.getElementById("status").innerHTML = 'GregChow.net is currently <span class="status-up">up</span>';
    } else {
        document.getElementById("status").innerHTML = 'GregChow.net is currently <span class="status-down">down</span>';
    }
  })
  .catch(error => console.error('Error:', error));
