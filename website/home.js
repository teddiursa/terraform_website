

//menu buttons
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

//add number suffix
function ordinalSuffix(i) {
    //last digit (one's place)
    var j = i % 10,
        //last 2 digits
        k = i % 100;
    // if ends in 1 and not 11, add st
    if (j == 1 && k != 11) {
        return i + "st";
    }
    // if ends in 2 and not 12, add nd
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    // if ends in 3 and not 13, add rd
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    // else add th
    return i + "th";
}

// Constants for conversion from seconds
const weekSeconds = 604800;
const daySeconds = 86400;
const hourSeconds = 3600;
const minuteSeconds = 60;

// Converts seconds to weeks, days, hours, and minutes
//make sure to use plural or singular as necessary
function secondsToWeeks(input) {
    time = input;
    //create empty string output
    let output = "";
    if (Math.trunc(time / weekSeconds) != 0) {
        output += Math.trunc(time / weekSeconds);
        //add weeks or week depending on amount
        if (Math.trunc(time / weekSeconds) > 1)
            output += " weeks";
        else
            output += " week";
        //reduce time for next type;
        time = time % weekSeconds;
    }
    if (Math.trunc(time / daySeconds) != 0) {
        //add space if already output (not needed for weeks)
        if (output != null)
            output += " ";
        output += Math.trunc(time / daySeconds);
        //add days or day depending on amount
        if (Math.trunc(time / daySeconds) > 1)
            output += " days";
        else
            output += " day";
        time = time % daySeconds;
    }
    if (Math.trunc(time / hourSeconds) != 0) {
        //add space if already output (not needed for weeks)
        if (output != null)
            output += " ";
        output += Math.trunc(time / hourSeconds);
        //add hours or hour depending on amount
        if (Math.trunc(time / hourSeconds) > 1)
            output += " hours";
        else
            output += " hour";
        time = time % hourSeconds;
    }
    if (Math.trunc(time / minuteSeconds) != 0) {
        //add space if already output (not needed for weeks)
        if (output != null)
            output += " ";
        output += Math.trunc(time / minuteSeconds);
        //add minute or minute depending on amount
        if (Math.trunc(time / minuteSeconds) > 1)
            output += " minutes";
        else
            output += " minute";
        time = time % minuteSeconds;
    }
    if (time >= 1) {
        //add space if already output (not needed for weeks)
        if (output != "")
            output += " and ";
        output += Math.trunc(time);
        //add seconds or second depending on amount
        if (Math.trunc(time) > 1)
            output += " seconds";
        else
            output += " second";
    }
    //for when refresh is less than a second
    else if (output == "") {
        output += "less than a second"
    }

    return output;
}

// varaibles for JSON url data
let urlCount = "";
let urlTime = "";
let counter = '<h2>You are the <span id="visitorCount" style="color:#67B868">105th</span> Visitor!</h2>        <h2>The last visitor was <span id="lastAccessed" style="color:#67B868">50 seconds</span>            ago </h2>        <h5>Created with AWS Lambda and DynamoDB</h5>'

// fetch JSON data containing urls, then fetch data from urls
fetch('https://s3.amazonaws.com/gregchow.jsonbucket/links.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Stores json urls into variables
    urlCount = data.urlCount;
    urlTime = data.urlTime;
	
	//increment loading text
	document.getElementById('counterID').innerHTML = "<h2>Loading..</h2>"

    // Call function to get visitor count from lambda function 
    return fetch(urlCount); 
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // update visitor Count
    counter.getElementById('visitorCount').innerText = ordinalSuffix(data.Count);
	
		//increment loading text
	document.getElementById('counterID').innerHTML = "<h2>Loading...</h2>"
    // Call function to get access time from lambda function
    return fetch(urlTime); 
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // update time        
    counter.getElementById('lastAccessed').innerText = secondsToWeeks(data.Time);
    //display block after loading
    document.getElementById('counterID').innerHTML = counter;
  .catch(error => console.error('Error:', error));

// function to iterate unix timer
setInterval(function () {
    document.getElementById('unixTime').innerText = Math.floor(Date.now() / 1000)
},
    1000);
