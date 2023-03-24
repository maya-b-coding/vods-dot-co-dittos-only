var is_filter_on = false 

if (document.readyState !== 'loading') { // If the document has already loaded, run initializing function. Otherwise, wait.
    start()
} else {
    document.addEventListener('DOMContentLoaded', function () {
        start()
    })
}

function start() {

	chrome.storage.local.get(["is_filter_on"]).then((result) => { //Read from local storage if the filter is on
		if (result.is_filter_on !== null) {
			is_filter_on = result.is_filter_on
		} 

	 	var filter_button = document.getElementById('filter_button') //Get the HTML Element for the button

	 	if (is_filter_on) { //Button defaults to off when loaded in, so turn it on if it is
			setButtonOn(filter_button) 
		}

		//Add button listener
	  	filter_button.addEventListener('click', function(){
			if (is_filter_on) {
				disable_filter(filter_button)
			} else {
				enable_filter(filter_button)
			}
		})
	})

	//Enable links from popup
	var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({active: true, url: location});
            };
        })();
    }
}
  	
function enable_filter(button) { //Send a message to content.js to activate button, then set styling and HTML when button is turned on
	//Temporarily disable button until response is  received
	button.disabled = true
	//Send request to content.js to enable filter
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {"action": "enable_filter"})
		.then(response => {
			//Check if request was successful
			if (response.successful === true) { //Success Case
				//If request went through fine change button text and styling
				button.innerHTML = "Deactivate"
				button.classList.replace("button_off", "button_on")
				//Set the filter to on (in memory and in local storage)
				is_filter_on = true
				chrome.storage.local.set({ is_filter_on: is_filter_on })
			} else { //Failure Case
				console.log("Warning: failed to activate filter!")
			}
		})
		.catch(error => {
			console.error(error)
		})
		.finally(() => {
			button.disabled = false
		})
	})
}

function disable_filter(button) {
	//Temporarily disable button until response is received
	button.disabled = true
	//Send request to content.js to enable filter
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {"action": "disable_filter"})
		.then(response => {
			//Check if request was successful
			if (response.successful === true) { //Success Case
				// If request went through fine change button text and styling
				button.innerHTML = "Activate"
				button.classList.replace("button_on", "button_off")
				//Set the filter to off (in memory and in local storage)
				is_filter_on = false
				chrome.storage.local.set({ is_filter_on: is_filter_on })
			} else { //Failure Case
				console.log("Warning: failed to activate filter!")
			}
		})
		.catch(error => {
			console.error(error)
		})
		.finally(() => {
			button.disabled = false
		})
	})
}

function setButtonOn(button) { //Visually changes the button to reflect that the filter is on
	button.innerHTML = "Deactivate"
	button.classList.replace("button_off", "button_on")
}