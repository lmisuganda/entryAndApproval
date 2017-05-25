if (true) {
	//load from DHIS2 server
	LS.updateAllFacilities(serverInterface.getAllFacilities());
	console.log("Working online");
} else {
	console.log("Working offline");
	
}
var facilities = LS.getFacilities();

generateMainMenu(); //located in scripts.js
generateFacilityList(facilities);

function generateFacilityList(facilities) {
	for (var i = 0; i < facilities.length; i++) {
		$("#facility_list").append(getListElement(facilities[i]));
	}
}

function getListElement(facility) {
	var liElement = document.createElement("LI");
	$(liElement).attr("id", getId(facility));
	var aElement = document.createElement("A");
	$(aElement).append('<i class="fa fa-home" aria-hidden="true"></i>');
	$(aElement).append(getName(facility));
	$(aElement).attr("href", "dashboard.html#facility=" + getId(facility));
	$(liElement).append(aElement);
	//appendStatusElements(liElement, facility);
	return liElement;
}

function appendStatusElements(listElement, facility) {
	var statusCounts = getFormStatusCounts(facility);
	var formsCount = getCountOfFormsCurrentCycle(facility);
	
	var statusElement = document.createElement("ASIDE");

	if (statusCounts.uncompleted > 0) {
		var waitingForCompletion = document.createElement("P");
		$(waitingForCompletion).append('<i class="fa fa-pencil-square-o" aria-hidden="true"></i>');
		$(waitingForCompletion).append(statusCounts.uncompleted + " of " + formsCount + " waiting for completion");
		$(statusElement).append(waitingForCompletion);
	}

	if (statusCounts.completed > 0) {
		var waitingForApproval = document.createElement("P");
		$(waitingForApproval).append('<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>');
		$(waitingForApproval).append(statusCounts.completed + " of " + formsCount + " waiting for approval");
		$(statusElement).append(waitingForApproval);
	}
	
	if (statusCounts.approved > 0) {
		var completedAndApproved = document.createElement("P");
		$(completedAndApproved).append('<i class="fa fa-check" aria-hidden="true"></i>');
		$(completedAndApproved).append(statusCounts.approved + " of " + formsCount + " completed and approved");
		$(statusElement).append(completedAndApproved);
	}
	
	$(statusElement).addClass("status_element");
	$(listElement).append(statusElement);
}

/*
function generateFacilitySummary(facilityElement) {
	$(facilityElement).addClass("initialized");
	var pendingList = document.createElement("UL");
	
	var completedList = document.createElement("UL");
	
	var approvedList = document.createElement("UL");
	
	var facilityId = $(facilityElement).attr("id");
	var facility = LS.getFacilityById(facilityId);
	var cycle = getCurrentCycle(facility);
	$(facilityElement).append(pendingList, completedList, approvedList);
	generateListOfCurrentCycleForms(cycle, pendingList, completedList, approvedList);
}

function generateListOfCurrentCycleForms(cycle, pendingList, completedList) {
	var forms = getForms(cycle);
	var pendingFormsCount = 0;
	var waitingForApprovalCount = 0;
	for (var i = 0; i < forms.length; i++) {
		if (isCompleted(forms[i])) {
			$(completedList).append(getListElement(cycle, forms[i]));
		} else {
			$(pendingList).append(getListElement(cycle, forms[i]));
			pendingFormsCount++;
		}
	}
	if (pendingFormsCount > 0) {
		$(pendingList).prepend("<h3>Forms waiting for data entry</h3>");
	} else if (waitingForApprovalCount > 0) {
		$(pendingList).prepend("<h3>Forms waiting for approval</h3>");
	}
}

function getListElement(cycle, form) {
	
	var listElement = document.createElement("LI");
	
	var link = document.createElement("A");
	$(link).text(getName(form));
	if (isCompleted(form)) {
		$(link).attr("href", "form_summary.html?facility="  + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	} else {
		$(link).attr("href", "form_overview.html?facility=" + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	}
	$(link).append(listElement);
	return link;
} */