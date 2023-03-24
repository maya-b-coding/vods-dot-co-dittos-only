var old_columns = null //Used to store old data after we apply the filter, so we can restore it later

if (document.readyState !== 'loading') { // If the document has already loaded, run initializing function. Otherwise, wait.
    start()
} else {
    document.addEventListener('DOMContentLoaded', function () {
        start()
    })
}

function start() {
	chrome.storage.local.get(["is_filter_on"]) //Check local storage
	.then((result) => {
		if (result.is_filter_on !== null && result.is_filter_on === true) { //enable the filter if storage says it is
			enable_filter()
		} 

		chrome.runtime.onMessage.addListener( //Add a listener for the message sent by the button from popup.js
			function(request, sender, sendResponse) {
				if (request.action === "enable_filter") {
					enable_filter()
				} else if (request.action === "disable_filter") {
					disable_filter()
				} else {
					console.log("Warning: invalid message sent to content.js")
					sendResponse({"successful": false})
				}
				sendResponse({"successful": true}) //Send a response indicating if the filter is on or not
			}
		)
	})
}

function disable_filter() { //restores the old columns to the document
	var columns = document.getElementById("columns")
	columns.innerHTML = old_columns.innerHTML
	columns = old_columns
}

function enable_filter() {
	//Store the existing "columns" div in case the user later disables the filter
	var columns = document.getElementById("columns")
	old_columns = columns.cloneNode(true)

	//Get all views-table (There is one per tournament)
	var views_tables = document.getElementsByClassName("views-table")
	
	for (let i = 0; i < views_tables.length; i++) { //Iterate through views_tables
		var view_tables_element = views_tables[i]
		var tbody = view_tables_element.getElementsByTagName('tbody') //Get tbody's (which is a list of matches)
		if (tbody.length !== 0) { //confirm it is not an empty list
			var match_list_tr = tbody[0].getElementsByTagName('tr')	//First tbody will contain the data

			var isEven = false //Used for replicating existing styling
			//Iterate through each match, and  remove any match that is not a ditto.
			for (let j = 0; j < match_list_tr.length; j++) {
				var isDitto = false
				//Get td elements (contain all match details)
				var match_list_td_list = match_list_tr[j].getElementsByTagName('td')
				//Check for and grab the 2nd element (this should contain the character icons and player names)
				
				if (match_list_td_list.length > 1) {
					var match_details_td = match_list_td_list[1]
					//Get a list of icons
					var img_list = match_details_td.getElementsByTagName('img') //Get list of images (character icons)
					var img_src_set = new Set()
					for (let k = 0; k < img_list.length; k++) {	//Check if there is any duplicate icons. If there are, it indicates two players played the same character (likely a Ditto)
						var img_src = img_list[k].getAttribute('src')
						if (img_src_set.has(img_src)) { // A duplicate icon has been found
							isDitto = true
							break
						}
						img_src_set.add(img_src)
					}
				}

				//Check if it's a ditto. Add proper styling if so, remove if not.
				if (isDitto) {
					if (isEven) { // Set styling according to odd/even 
						match_list_tr[j].classList.replace("odd", "even")
					} else {
						match_list_tr[j].classList.replace("even", "odd")
					}
					isEven = !isEven
				} else {
					match_list_tr[j].innerHTML = ""
				}
			}
		}
	}
}