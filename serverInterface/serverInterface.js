var useTempData = true; //Use temp local data (no server communication)

var serverInterface = {
	
	getAllFacilities:
	function () {
		if (useTempData) {
			return getTestDataFacilities();
		}
	},
	
	getFacilityById:
	function (id) {
		
	},
	
	getFormById:
	function (facilityId, cycleId, FormId) {
		
	},
	
	getSectionById:
	function (facilityId, cycleId, FormId, SectionId) {
		
	},
	
	
}