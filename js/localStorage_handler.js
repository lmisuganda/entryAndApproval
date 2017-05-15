var StorageHandler = {
	
	getFacilities: 
	function () {

	},
	
	downloadFacilityToLocalStorage:
	function (facilityId, pageInitFunction) {
		if (this.serverIsAvailable) {
			//load from DHIS2 server
			var freshdata;
			showWaitingScreen(); //located in scripts.js
			server_interface.getFacilityById("temp").then(function() {
				freshdata = blablabla;
				setTimeout(function() { //TEMP wait for cycles
					LS.updateFacility(freshdata);
					console.log("Data updated from DHIS2 server");
					pageInitFunction();
					hideWaitingScreen();
				}, 2000);
			});

		} else {
			console.log("No data update");
			if (LS.contains(LS.generateFacilityId(facilityId))) {
				pageInitFunction();
			} else {
				console.log("Error: facility not stored in localStorage. Redirecting");
				showMessageBox("<p>Facility is not available offline. Get internet access to download facility information</p>", function() {
					navigateToAddress("index.html");
				});
			}
		} //
	},
	
	downloadFormToLocalStorage:
	function (formId, pageInitFunction) {
		
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

	getFacilities: 
	function () {
		var result = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith("facility_")) { 
				result.push(localStorage.getObject(key)); 
			}
		}
		return result;
	},
	
	getFacilityById: 
	function (id) {
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			
			if (key.startsWith(this.generateFacilityId(id))) { 
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
		var key = this.generateFacilityId(getId(facility));
		localStorage.setObject(key, facility);
		
	},
	
	generateFacilityId:
	function (id) {
		return "facility_" + id;
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

