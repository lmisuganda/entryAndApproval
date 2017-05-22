// DHIS2 LMIS ORDER/REPORT APP.  
// PROGRAM INDICATOR CALCULATION HANDLER FOR DATA ENTRY SCREEN. 


//# ----------------------   DEFINE AUTOCALCULATED INPUT FIELD HERE --------------------- #
var autoCalcRules = [
	{
		name: "Adjusted AMC",
		description: "Adjusted AMC",
		expression: "(#{ART & PMTCT consumption} * 60) / (60 - #{Days out of stock})",
	},
	{
		name: "Months of stock on hand",
		description: "Test",
		expression: "#{Closing balance} / #{Adjusted AMC}",
	},
	{
		name: "Quantity required",
		description: "Test",
		expression: "4 * #{Adjusted AMC} - #{Closing balance}",
	},
]



//# ---------------------   AUTOCALCULATION FUNCTIONS ------------------------------------ #
function getIndicatorByName(indicators, name) {
	for (var i = 0; i < indicators.length; i++) {
		if (indicators[i].name == name) return indicators[i];
	}
	return false;
}

//Calculates and prints value of indicators (based on value of provided input elements)
function calculateAndPrintIndicators(indicators, inputElements) {
	indicators = autoCalcRules;
	for (var i = 0; i < inputElements.length; i++) {
		if ($(inputElements[i]).attr("disabled")) {
			var indicator = getIndicatorByName(indicators, $(inputElements[i]).attr("name"));
			if (indicator) {
				console.log("Updating calucation");
				var calculation = Math.ceil(calculateExpression(indicator.expression, inputElements));
				if (calculation) $(inputElements[i]).val(calculation);
			}
		}
	}
}

// calculates DHIS2 indicator expressions by resolving values from input-fields and evaluating expressions with values. 
function calculateExpression(exp, currentInputFields) {
	var convExp = "";
	var i = 0;
	while (i < exp.length) {
		
		if (exp.charAt(i) == "#") {
			var name = exp.substr(i + 2, exp.substr(i + 2, exp.length).indexOf("}"));
			var inputValue = getValueFromDataInputElementByName(name, currentInputFields);
			
			if (inputValue == "") return 0;
			if (inputValue == 0) inputValue = 1;
			inputValue = "(" + inputValue + ")";
			convExp += inputValue;
			i += name.length + 3;
		} else { 
			convExp += exp.charAt(i++);
		} 
	}
	return eval(convExp);
}