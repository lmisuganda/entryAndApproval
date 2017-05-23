var StorageHandler = {
	
	
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
			StorageHandler.displayConnectionWarning("Working offline", "infinite", "orange", "Your computer have no internet connection. You can keep working, and the system will try to reconnect automatically");
			
			if (LS.containsFacility(facilityId)) {
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
		
		//if facility data is not stored in local storage -> navigate to dashboard for init
		if (!LS.containsFacility(facilityId)) navigateToAddress("dashboard.html#facility=" + facilityId);
		
		var freshdata;
		showWaitingScreen(); //located in scripts.js
		
		//fetch data from server
		server_interface.setForm(formId).then(function() {
			freshdata = forms[0];
			LS.updateForm(facilityId, cycleId, freshdata);
			console.log("Data updated from DHIS2 server");
			pageInitFunction();
			hideWaitingScreen();
			
		}, function (reason) { //on error (no connection etc.) no update on local storage)
			StorageHandler.displayConnectionWarningNoConnection();
			console.log("Working offline: no data update");
			if (LS.containsForm(facilityId, cycleId, formId))  {
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


	displayConnectionWarningNoConnection:
	function () {
		StorageHandler.displayConnectionWarning("Working offline", "infinite", "orange", "Your computer have no internet connection. You can keep working, and the system will try to reconnect automatically");
	},
	
	displayConnectionWarning:
	function (text, timeout, color, infoText) {
		$("#connection_warning").remove();
	
		var elem = document.createElement("P");
		$(elem).attr("id", "connection_warning"); //styles located in style.css
		$(elem).text(text);
		
		if (!isUndefinedOrNull(infoText)) {
			var infoButton = ('<i class="fa fa-info-circle" aria-hidden="true"></i>');
			$(elem).append(infoButton);
			$(elem).click(function() { 
				console.log("hei");
				showMessageBox("<p>" + infoText + "</p>");
			});
		}
		
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
	
	updateFacilityOnServer: 
	function () {

	},
	
	updateFormOnServer: 
	function () {

	},
	
	updateSectionOnServer: 
	function (facilityId, form, section) {
		server_interface.updateSectionOnServer(facilityId, getId(form), section).then(function() {
				console.log("SUCCESS: Section " + getId(section) + " was updated on server!");
			}, function(reason) {
				console.log("ERROR: Section " + getId(section) + " was NOT updated on server");
				sync_queue.addForm(form);
				var testform = form;
				testform.id = "89HM";
				sync_queue.addForm(testform);
				sync_queue.pushDataToServerWhenOnline();
			});
	},
	
	updateCommodityOnServer: 
	function () {

	},
}

var sync_queue = {
	
	active: false,
	
	pushDataToServerWhenOnline:
	function () {
		if (!sync_queue.active) {
			sync_queue.active = true;
			var interval = 9000;
			var i = 0; //temp test
			StorageHandler.displayConnectionWarningNoConnection();
			var checkLoop = setInterval(function () {
				console.log("You are offline and data is waiting for upload. Retrying");
				
				var formsWaitingToSync = sync_queue.getForms();
				if (sync_queue.updateFormsOnServer(formsWaitingToSync)) { 
					console.log("Back online! Data uploaded :-)");
					StorageHandler.displayConnectionWarning("Back online! Data uploaded :-)", 10000, "#449d44");
					sync_queue.active = false;
					clearInterval(checkLoop);				
				}
			}, interval)
		}
	},
	
	//recursive function that tries to upload all forms in queue to server. 
	updateFormsOnServer:
	function() {
		var forms = sync_queue.getForms();
		if (forms.length == 0) return true;
		
		if (sync_queue.updateSingleFormOnServer(forms[0])) {
			sync_queue.removeForm(forms[0]);
			return sync_queue.updateFormsOnServer();
		} else {
			return false;
		}
	},
	
	updateSingleFormOnServer: //temp imp
	function(form) {
		console.log("Form with id " + getId(form) + " updated on server");
		return true;
	},

	//#### storage for unsynced forms
	addForm:
	function (form) {
		var key = "lmis_unsyncedForm_" + getId(form);
		localStorage.setObject(key, form);
		console.log("Form added to sync queue");
	},
	
	removeForm:
	function (form) {
		var key = "lmis_unsyncedForm_" + getId(form);
		localStorage.removeItem(key);
	},
	
	getForms:
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
			if (key.startsWith(this.getFacilityPrefix())) { 
				result.push(localStorage.getObject(key)); 
			}
		}
		return result;
	},
	
	getFacilityById: 
	function (id) {
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			
			if (key.startsWith(this.getFacilityPrefix() + id)) { 
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
		var key = this.getFacilityPrefix() + getId(facility);
		localStorage.setObject(key, facility);
		
	},
	
	//#### storage for local forms
	updateForm:
	function (facilityId, cycleId, form) {
		var facility = LS.getFacilityById(facilityId);
		console.log(cycleId);
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
		
	contains: 
	function(key) {
		return (key in localStorage);
	},
	containsFacility: 
	function(id) {
		console.log("ID: " + LS.getFacilityPrefix() + id);
		return LS.contains(LS.getFacilityPrefix() + id);
	},
	containsForm: 
	function(facilityId, cycleId, formId) {
		if (!LS.containsFacility(facilityId)) return false;
		
		var facility = LS.getFacilityById(facilityId);
		var cycle = getCycleById(facility, cycleId);
		var forms = getForms(cycle);
		for (var i = 0; i < forms.length; i++) {
			if (getId(forms[i]) == formId) {
				return true;
			}
		}
		return false;
	}
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

