// DHIS2 LMIS ORDER/REPORT APP.
// DATA ENTRY VALIDATION HANDLER

var DataEntryValidation = {
	
	//# ----------------------   DEFINE VALIDATION RULES HERE --------------------- #
	// for operator format see getOperator function. 

	validationRules: [
		{
			operator: "less_than_or_equal_to",
			instruction: "Test consumption should be less or equal to opening balance + quantity received.",
			leftSide: {
				expression: "#{ART & PMTCT consumption}",
			},
			rightSide: {
				expression: "#{Opening balance}+#{Quantity received}",
			},
		},
		{
			operator: "less_than",
			instruction: "Days out of stock should be less than 60 days (this is for a two month cycle)",
			leftSide: {
				expression: "#{Days out of stock}",
			},
			rightSide: {
				expression: "60",
			},
		}

	],
	
	
	//# ---------------------   DATA ENTRY VALIDATION FUNCTIONS ------------------------------------ #

	//converting DHIS2 operators to logical operators
	getOperator:
	function (text) {
		var operators = [];
		operators["equal_to"] = "==";
		operators["not_equal_to"] = "!=";
		operators["greater_than"] = ">";
		operators["greater_than_or_equal_to"] = ">=";
		operators["less_than"] = "<";
		operators["less_than_or_equal_to"] = "<=";
		operators["compulsory_pair"] = "===";

		return operators[text];
	},
	
	validateCommodityInput: 
	function (commodityId, form) {
		currentInputFields = $(form).find("input").not(":checkbox");
		console.log("Running validation");


		//HTML5 validation (on required fields and correct data type)
		if(form.checkValidity()) {
			console.log("   - HTML5 validation OK");
		} else {
			console.log("   - HTML5 validation FAILED");
			$(form).find(":submit").click(); //trigger HTML5 validation messages
			return ["Missing required values"];
		}
		var result = [];

		var j = 0;
		//run rules 
		for (var i = 0; i < this.validationRules.length; i++) {
			if (this.checkValidationRule(this.validationRules[i], currentInputFields) === true) {
				console.log("   - TESTVAL OK");
			} else {
				console.log("   - TESTVAL FAILED");
				console.log("     " + this.validationRules[i].instruction);
				result[j++] = this.validationRules[i].instruction;
			}
		}
		
		return result;
	},

	//tests validation rule based on list of rules defined, and list of current input fields
	//returns true or error message based on instruction defined in rule.
	checkValidationRule:
	function (rule, currentInputFields) {
		var left = this.convertExpression(rule.leftSide.expression, currentInputFields);
		var right = this.convertExpression(rule.rightSide.expression, currentInputFields);
		var operator = this.getOperator(rule.operator);
		try {
			var result = eval("" + left + operator + right);
			if (!result) return rule.instruction;
		}
		catch(err) {
			//console.log(err.message);
		}
		return true;
	},

	//takes left or right expression and converts to mathematical expression with resolved input values
	convertExpression:
	function (exp, currentInputFields) {
		var convExp = "";
		var i = 0;
		while (i < exp.length) {
			if (exp.charAt(i) == "#") {
				var id = exp.substr(i + 2, exp.substr(i + 2, exp.length).indexOf("}"));
				convExp += this.getValueFromDataInputElementByName(id, currentInputFields);
				i += id.length + 3;
			} else {
				convExp += exp.charAt(i++);
			}
		}
		return convExp;
	},

	//returns input value from textbox based on id and list of inputs
	getValueFromDataInputElement:
	function (id, currentInputFields) {
		var i = 0;
		while (i < currentInputFields.length) {
			if (currentInputFields[i].id == "de_" + id) return currentInputFields[i].value;
			i++;
		}
	},
	
	//returns input value from textbox based on NAME and list of inputs
	getValueFromDataInputElementByName:
	function (name, currentInputFields) {
		var name = name.toLowerCase().trim();
		var i = 0;
		while (i < currentInputFields.length) {
			if (currentInputFields[i].name.toLowerCase().trim() == name) return currentInputFields[i].value;
			i++;
		}
	},
}
