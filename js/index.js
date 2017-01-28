if (true) {
	//load from DHIS2 server
	LS.updateAllFacilities(facilities);
	console.log("Working online");
} else {
	console.log("Working offline");
	
}

generateFacilityList(facilities);

function generateFacilityList(facilities) {
	for (var i = 0; i < facilities.length; i++) {
		var liElement = document.createElement("LI");
		var aElement = document.createElement("A");
		$(aElement).text(getName(facilities[i]));
		$(aElement).attr("href", "dashboard.html?facility=" + getId(facilities[i]));
		$(liElement).append(aElement);
		$("#facility_list").append(liElement);
	}
}