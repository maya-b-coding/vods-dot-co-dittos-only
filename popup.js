var filter_on = false

if (document.readyState !== 'loading') { // If the document has already loaded, run initializing function. Otherwise, wait.
    start();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        start();
    });
}

function start() {

	chrome.storage.local.get(["filter_on"]).then((result) => {
		if (result.filter_on !== null) {
			console.log("popup.js -- filter_on_value read from local storage is " + result.filter_on);
			filter_on = result.filter_on
		} else {
			console.log("popup.js -- filter_on is undefined in local storage. Defaulting to false")
		}

		console.log("filter_on = ", filter_on)
	 	var filter_button = document.getElementById('filter_button');

	 	if (filter_on) {
			setButtonOn(filter_button)
		} else {
			setButtonOff(filter_button)
		}

	  	filter_button.addEventListener('click', function() {
	  		console.log("button clicked")
	  		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
	    		chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"})
	    		.then(response => {
	    			console.log("response = ", response)
	    		})
	    		.catch(error => {
	    			console.error(error)
	    		})
			})
			/*.then(response => { 
				console.log("response = ", response)
			})*/
			//Alternate button text
			//TODO: This should ideally  be done based on response (and the button should freeze and wait)
			if (filter_on) {
				setButtonOff(filter_button)
				filter_on = false //set filter in memory
				chrome.storage.local.set({ filter_on: filter_on }).then(() => { //Set filter_on in local storage (persistent)
				  console.log("Filter on is set to " + filter_on);
				});
			} else {
				setButtonOn(filter_button)
				filter_on = true 
				chrome.storage.local.set({ filter_on: filter_on }).then(() => {
				  console.log("Filter on is set to " + filter_on);
				});
			}
		})
	})


}
  	
function setButtonOn(button) { //Send a message to content.js to activate button, then set styling and HTML when button is turned on
	button.innerHTML = "Deactivate"
	button.classList.replace("button_off", "button_on")
}

function setButtonOff(button) {
	button.innerHTML = "Activate"
	button.classList.replace("button_on", "button_off")
}
