if (true) {
	//load from DHIS2 server
	LS.updateAllFacilities(facilities);
	console.log("Working online");
} else {
	console.log("Working offline");
	
}

generateMainMenu(); //located in scripts.js
generateFacilityList(facilities);

function generateFacilityList(facilities) {
	for (var i = 0; i < facilities.length; i++) {
		var liElement = document.createElement("LI");
		$(liElement).attr("id", getId(facilities[i]));
		var aElement = document.createElement("A");
		$(aElement).text(getName(facilities[i]));
		
		var menu = document.createElement("MENU");
		var details = document.createElement("I");
		$(details).attr("class", "fa fa-info-circle");
		$(details).attr("aria-hidden", "true");
		//$(menu).append('<i class="fa fa-home" aria-hidden="true"></i>');
		//$(menu).append(details);
		$(liElement).append(menu);
		
		$(aElement).attr("href", "dashboard.html?facility=" + getId(facilities[i]));
		$(liElement).append(aElement);
		$("#facility_list").append(liElement);
		
		$(details).on("click", function() {
			var element = this.parentNode.parentNode;
			if (!$(element).hasClass("initialized")) {
				generateFacilitySummary(element);
				$(element).append('<a href="test">Go to facility dashboard</a>');
			}
		})
		
	}
}

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
	$(listElement).text(getName(form));
	
	var link = document.createElement("A");
	if (isCompleted(form)) {
		$(link).attr("href", "form_summary.html?facility="  + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	} else {
		$(link).attr("href", "form_overview.html?facility=" + "&cycle=" + getId(cycle) + "&form=" + getId(form));
	}
	$(link).append(listElement);
	return link;
}