var StorageHandler = {
	
	getFacilities: 
	function () {

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
	}
	
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

