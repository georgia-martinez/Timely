var websites = []; // Array of website URLS being tracked

document.addEventListener("DOMContentLoaded", function() {
    loadWebsites();

    document.getElementById("reset").addEventListener("click", clearStorage); // Reset button
    document.getElementById("add-website").addEventListener("click", addWebsite); // Add website button
});

// Clears saved websites
function clearStorage(){
    chrome.storage.sync.clear();
    websites = [];

    chrome.runtime.sendMessage({
        message: "reset"
    });

    document.getElementById("websites-tracked").innerHTML = '';
    document.getElementById("input-error").innerHTML = "";
}

// Update times when pop-up is opened
function loadWebsites(){
    chrome.runtime.sendMessage({
        message: "load"
    });
}

// Loads saved websites
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.message == "load"){
        chrome.storage.sync.get({websiteObjects:[]}, function(data){
            websiteObjects = data.websiteObjects;
            
            // Display all loaded websites
            for(var i = 0; i < websiteObjects.length; i++){
                displayWebsite(websiteObjects[i].url, websiteObjects[i].formattedTime);
                websites.push(websiteObjects[i].url);
            }
        });
    }
});

// Add a website to be tracked
function addWebsite(){
    var errorMessage = document.getElementById("input-error");

    try {
        // Parse URL
        var searchBar = document.getElementById("search-bar");
        var url = searchBar.value;
        url = new URL(url).host;

        // Check if the website is already being tracked
        if(!websites.includes(url) && url){
            websites.push(url);

            displayWebsite(url, "0s");
        
            // Send URL to background.js
            chrome.runtime.sendMessage({
                message: "add",
                sentURL: url
            });
        
            searchBar.value = "";
            errorMessage.innerHTML = "";

            console.log(url + " was added");
        }else{
            errorMessage.innerHTML = "You are already tracking this site";
            //document.getElementById("input-error").innerHTML = "You are already tracking this site";
        }
    } catch (error) {
        errorMessage.innerHTML = "Invalid URL";
    }
}

// Displays website in pop-up
function displayWebsite(url, formattedTime){
    var container = document.createElement("div"); // Div for website elements
    container.classList.add("flex");

    var favicon = document.createElement("img"); // Favicon
    favicon.src = "https://www.google.com/s2/favicons?domain="+url;
    favicon.classList.add("website-favicon");

    var name = document.createElement("p"); // Website name
    name.appendChild(document.createTextNode(url));
    name.classList.add("website-name");

    var time = document.createElement("p"); // Time spent
    time.appendChild(document.createTextNode(formattedTime));
    time.classList.add("website-time");

    var remove = document.createElement("button"); // Remove button
    remove.appendChild(document.createTextNode("x"));
    remove.classList.add("remove-website");

    // Adding elements to container div
    container.appendChild(favicon);
    container.appendChild(name);
    container.appendChild(time);
    container.appendChild(remove);

    // Remove website from tracking list
    remove.addEventListener("click", function () {
        var toBeRemoved = this.parentElement.children[1].textContent; // Set to URL

        for(var i = 0; i < websites.length; i++){
            if(websites[i] == toBeRemoved){
                console.log(toBeRemoved + " was removed");
                chrome.runtime.sendMessage({
                    message: "remove",
                    sentURL: url
                });

                websites.splice(i, 1);
                break;
            }
        }

        this.parentNode.remove();
    });

    // Adding container to pop-up
    var websitesTracked = document.getElementById("websites-tracked");
    websitesTracked.appendChild(container);
}