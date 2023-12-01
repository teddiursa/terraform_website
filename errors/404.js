document.addEventListener("DOMContentLoaded", function () {
    checkStatus();
});

function checkStatus() {
    var url = "https://gregchow.net";
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                document.getElementById("status").innerHTML = 'The current status of gregchow.net is: <span class="status-up">up</span>';
            } else {
                document.getElementById("status").innerHTML = 'The current status of gregchow.net is: <span class="status-down">down</span>';
            }
        })
        .catch(function (error) {
            document.getElementById("status").innerText = "Error checking the status of gregchow.net.";
        });
}