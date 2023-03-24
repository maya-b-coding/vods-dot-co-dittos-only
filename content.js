var filter_on = false
var old_columns = null

if (document.readyState !== 'loading') { // If the document has already loaded, run initializing function. Otherwise, wait.
    start();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        start();
    });
}

function start () {
	chrome.storage.local.get(["filter_on"]).then((result) => {
		if (result.filter_on !== null) {
			console.log("content.js -- filter_on_value read from local storage is " + result.filter_on);
			filter_on = result.filter_on
		} else {
			console.log("content.js -- filter_on is undefined in local storage. Defaulting to false")
		}

		console.log("filter_on = ", filter_on) //If filter is set to on in local, initialize with filter on
		if (filter_on) {
			console.log("enabling filter")
			enable_filter()
		}

		chrome.runtime.onMessage.addListener( //only add the listener after the local storage has been read. 
			function(request, sender, sendResponse) {
				if (filter_on) {
					disable_filter()
					filter_on = false;
				} else {
					enable_filter()
					filter_on = true
				}
				sendResponse(true) //Send a resposne indicating if the filter is on or not
			}
		)
	});
}

//var old_views_tables
function disable_filter() { //restores the old columns to the document
	var columns = document.getElementById("columns")
	columns.innerHTML = old_columns.innerHTML
	columns = old_columns
}

function enable_filter() {
	//Creating Elements

	//Store the existing "columns" div, in case they want to turn the filter off
	var columns = document.getElementById("columns")
	old_columns = columns.cloneNode(true)

	//Get all views-table (1 per date/tournament)
	var views_tables = document.getElementsByClassName("views-table")


	for (let i = 0; i < views_tables.length; i++) { 
		var view_tables_element = views_tables[i]
		var tbody = view_tables_element.getElementsByTagName('tbody') //Get tbody which is a list of matches
		if (tbody.length !== 0) {
			var match_list_tr = tbody[0].getElementsByTagName('tr')

			var isEven = false
			//Iterate through each match, and  remove any match that is not a ditto.
			for (let j = 0; j < match_list_tr.length; j++) {
				var isDitto = false
				//Get td elements
				var match_list_td_list = match_list_tr[j].getElementsByTagName('td')
				//Check for and grab the 2nd element (this should contain the match details)
				
				if (match_list_td_list.length > 1) {
					var match_details_td = match_list_td_list[1]
					//Get a list of icons
					var img_list = match_details_td.getElementsByTagName('img')
					var img_src_set = new Set()
					//console.log(img_list)
					for (let k = 0; k < img_list.length; k++) {
						var img_src = img_list[k].getAttribute('src')
						//console.log('img_src = ', img_src)
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