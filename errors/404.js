document.addEventListener("DOMContentLoaded", function () {
    checkStatus();
});

function checkStatus() {
    var url = "https://gregchow.net";
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                document.getElementById("status").innerHTML = 'www.gregchow.net is currently: <span class="status-up">up</span>';
            } else {
                document.getElementById("status").innerHTML = 'www.gregchow.net is currently: <span class="status-down">down</span>';
            }
        })
        .catch(function (error) {
            document.getElementById("status").innerText = "Error checking the status of gregchow.net.";
        });
}

// Check with lambda for better compatability
//TODO
// fetch('https://rma0hn88p2.execute-api.us-east-1.amazonaws.com/websiteTime/') //get last time via lambda function
//     .then(response => response.json())
//     .then((data) => {
//         if (data == 'Up') {
//             document.getElementById("status").innerHTML = 'www.gregchow.net is currently: <span class="status-up">up</span>';
//         } else {
//             document.getElementById("status").innerHTML = 'www.gregchow.net is currently: <span class="status-down">down</span>';
//         }
//     })