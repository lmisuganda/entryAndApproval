var StorageHandler = {
	
	//TO ADD: list of unsynced forms. Upload before download. (stored in LS)
	
	getFacilities: 
	function () {

	},
	
	downloadFacilityToLocalStorage:
	function (facilityId, pageInitFunction) {
		//load from DHIS2 server
		var freshdata;
		showWaitingScreen(); //located in scripts.js
		
		
		//fetch data from server
		server_interface.setFacility(facilityId).then(function() {
			freshdata = facility;
			LS.updateFacility(freshdata);
			console.log("Data updated from DHIS2 server");
			pageInitFunction();
			hideWaitingScreen();
			
		}, function (reason) { //on error (no connection etc.) no update on local storage
			console.log("No data update: " + reason.status);
			StorageHandler.displayConnectionWarning("Working offline", 8000, "orange");
			//LS.contains(LS.getFacilityPrefix() + facilityId)
			if (true) {
				pageInitFunction();
			} else {
				console.log("Error: facility not stored in localStorage. Redirecting");
				showMessageBox("<p>Facility is not available offline. Get internet access to download facility information</p>", function() {
					navigateToAddress("index.html");
				});
			}
			hideWaitingScreen();
			
		});

	},
	
	downloadFormToLocalStorage:
	function (facilityId, cycleId, formId, pageInitFunction) {
		if (this.serverIsAvailable) {
			//load from DHIS2 server
			var freshdata;
			showWaitingScreen(); //located in scripts.js
			server_interface.setForm(formId).then(function() {
				freshdata = forms[0];
				LS.updateForm(facilityId, cycleId, freshdata);
				console.log("Data updated from DHIS2 server");
				pageInitFunction();
				hideWaitingScreen();
				
			});

		} else {
			console.log("No data update");
			if (LS.contains(LS.getFacilityPrefix() + facilityId))  {
				pageInitFunction();
			} else {
				console.log("Error: facility not stored in localStorage. Redirecting");
				showMessageBox("<p>Facility is not available offline. Get internet access to download facility information</p>", function() {
					navigateToAddress("index.html");
				});
			}
		} //
	},
	
	serverIsAvailable:
	function() {

	  // Handle IE and more capable browsers
	  var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
	  var status;

	  // Open new request as a HEAD to the root hostname with a random param to bust the cache
	  xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

	  // Issue request and handle response
	  try {
		xhr.send();
		return ( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) );
	  } catch (error) {
		return false;
	  }

	},
	
	waitForServerConnectionAndSync:
	function () {
		var interval = 3000;
		var i = 0; //temp test
		StorageHandler.displayConnectionWarning("You are offline! Will retry upload shortly", "infinite");
		var checkLoop = setInterval(function () {
			console.log("You are offline and data is waiting for upload. Retrying");
			i++; //temp test
			if (i > 1) { //if connection --> for all unsynced forms and sections --> upload --> then remove from queue
				console.log("Back online! Data uploaded :-)");
				StorageHandler.displayConnectionWarning("Back online! Data uploaded :-)", 10000, "#449d44");
				clearInterval(checkLoop); 
			}
		}, interval)
			
		
	},
	
	displayConnectionWarning:
	function (text, timeout, color) {
		$("#connection_warning").remove();
		var elem = document.createElement("P");
		$(elem).attr("id", "connection_warning"); //styles located in style.css
		$(elem).text(text);
		$(elem).css("background-color", color);
		$("body").append(elem);
		$(elem).slideDown(200);
		if (timeout != "infinite") {
			setTimeout(function() {
				$(elem).remove();
			}, timeout)	
		}	
	},
	
	hideConnectionWarning:
	function () {
		$("#connection_warning").remove();
	},
	
	updateFacility: 
	function () {

	},
	
	updateForm: 
	function () {

	},
	
	updateSection: 
	function () {

	},
	
	updateCommodity: 
	function () {

	},
}

var LS = {

	//#### storage for facility-object
	getFacilityPrefix: 
	function () {
		return "lmis_facility_"
	},
	
	getFacilities: 
	function () {
		var result = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith(this.getFacilityPrefix)) { 
				result.push(localStorage.getObject(key)); 
			}
		}
		return result;
	},
	
	getFacilityById: 
	function (id) {
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			
			if (key.startsWith(this.getFacilityPrefix + id)) { 
				return localStorage.getObject(key); 
				
			}
		}
		return null;
	},
	
	updateAllFacilities:
	function (facilities) {
		for (var i = 0; i < cycles.length; i++) {
			this.updateFacility(facilities[i]);
		}
	},
	
	updateFacility:
	function (facility) {
		var key = this.getFacilityPrefix + getId(facility);
		localStorage.setObject(key, facility);
		
	},
	
	//#### storage for local forms
	updateForm:
	function (facilityId, cycleId, form) {
		var facility = LS.getFacilityById(facilityId);
		var cycle = getCycleById(facility, cycleId);
		var forms = getForms(cycle);
		var existing = false;
		for (var i = 0; i < forms.length; i++) {
			if (getId(forms[i]) == getId(form)) {
				forms[i] = form;
				existing = true;
				console.log("Form with id " + getId(form) + " was updated in localstorage");
			}
		}
		if (!existing) {
			forms.push(form);
			console.log("Form with id " + getId(form) + " was added to localstorage");
		}
		
		LS.updateFacility(facility); //save back to local storage
	},
	
	//#### storage for unsynced forms
	addToUnsyncedList:
	function (form) {
		var key = "lmis_unsyncedForm_" + getId(form);
		localStorage.setObject(key, form);
	},
	
	removeFromUnsyncedList:
	function (form) {
		var key = "lmis_unsyncedForm_" + getId(form);
		localStorage.removeItem(key);
	},
	
	getUnsyncedForms:
	function () {
		var result = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith("lmis_unsyncedForm_")) { 
				result.push(localStorage.getObject(key)); 
			}
		}
		return result;
	},
	
	contains: 
	function(key) {
		return (key in localStorage);
	}
	
	
}


Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

