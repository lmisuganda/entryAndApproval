
if (false) {
	//load from DHIS2 server
	updateLS(cycles);
	console.log("Working online");
} else {
	console.log("Working offline");
}

var facilityId = getParameterFromURLByName("facility");
if (isUndefinedOrNull(facilityId)) navigateToAddress("index.html");

var facility = LS.getFacilityById(facilityId);
if (isUndefinedOrNull(facility)) navigateToAddress("index.html");

generateFacilityInfoSection();
generateListOfCurrentCycleForms(getCurrentCycle(facility));
generateListOfPreviousCycles(getPreviousCycles(facility));

function generateFacilityInfoSection() {
	$("#facility_title_header").text(getName(facility));
}

function generateListOfCurrentCycleForms(cycle) {
	$("#current_cycle_header").text("Current Cycle: " + getId(cycle))
	var forms = getForms(cycle);
	var pendingFormsCount = 0;
	for (var i = 0; i < forms.length; i++) {
		if (isCompleted(forms[i])) {
			$("#submitted_forms").append(getListElement(cycle, forms[i]));
		} else {
			$("#pending_forms").append(getListElement(cycle, forms[i]));
			pendingFormsCount++;
		}
	}
	if (pendingFormsCount == 0) {
		$("#pending_forms").append("<br><p>Wohoo! All forms submitted for this cycle</p>");
	}
}

function generateListOfPreviousCycles(cycles) {
	console.log(cycles);
	for (var i = 0; i < cycles.length; i++) {
		var listElement = document.createElement("LI");
		var detailElement = document.createElement("DETAILS");
		var summaryElement = document.createElement("SUMMARY");
		$(summaryElement).text("2016: cycle " + getId(cycles[i]));
		$(detailElement).append(summaryElement);
		$(listElement).append(detailElement);
		$("#previous_cycles").append(listElement);
		//buildListOfForms("#previous_cycles"), 
		var forms = getForms(cycles[i]);
		for (var j = 0; j < forms.length; j++) {
			$(detailElement).append(getListElement(cycles[i], forms[j]));
		}
	}
}



function getListElement(cycle, form) {
	
	var listElement = document.createElement("LI");
	$(listElement).text(getName(form));
	
	var link = document.createElement("A");
	if (isCompleted(form)) {
		$(link).attr("href", "form_summary.html?facility=" + facilityId + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	} else {
		$(link).attr("href", "form_overview.html?facility=" + facilityId + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	}
	$(link).append(listElement);
	return link;
}
