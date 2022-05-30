var tab = '';

$(document).ready(function () {
	$('input#wordwrapCheckbox').change(
		function () {
			if ($(this).is(':checked')) {
				wrapJsons();
			} else {
				unwrapJsons();
			}
		}
	);
	$('input#minifyCheckbox').change(
		function () {
			if ($(this).is(':checked')) {
				beautifyJsons();
			} else {
				minifyJsons();
			}
		}
	);
});

var textareaHeight = 500;
var textareaWidth = 500;
var waiting;
var jsonSchemaEditor = CodeMirror.fromTextArea
	(document.getElementById('jsonSchemaArea'), {
		mode: "application/ld+json",
		theme: "dracula",
		lineNumbers: true,
		lineWrapping: true,
		scrollbarStyle: "simple",
		extraKeys: {
			"F11": function (cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function (cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
		}
	});
jsonSchemaEditor.on('change', jsonSchemaEditor => {
	try {
		clearTimeout(waiting);
		waiting = setTimeout(updateHints, 500);
	} catch (err) {
		console.log("Invalid Json")
	}
});
setTimeout(updateHints, 100);
var widgets = [];
function updateHints() {
	jsonSchemaEditor.operation(function () {
		for (var i = 0; i < widgets.length; ++i)
			jsonSchemaEditor.removeLineWidget(widgets[i]);
		widgets.length = 0;

		JSHINT(jsonSchemaEditor.getValue());
		for (var i = 0; i < JSHINT.errors.length; ++i) {
			var err = JSHINT.errors[i];
			if (!err) continue;
			var msg = document.createElement("div");
			var icon = msg.appendChild(document.createElement("span"));
			icon.innerHTML = "⛔";
			icon.className = "lint-error-icon";
			msg.appendChild(document.createTextNode(err.reason));
			msg.className = "lint-error";
			widgets.push(jsonSchemaEditor.addLineWidget(err.line - 1, msg, { coverGutter: false, noHScroll: true }));
			break;// added by vivek
		}
	});
	var info = jsonSchemaEditor.getScrollInfo();
	var after = jsonSchemaEditor.charCoords({ line: jsonSchemaEditor.getCursor().line + 1, ch: 0 }, "local").top;
	if (info.top + info.clientHeight < after)
		jsonSchemaEditor.scrollTo(null, after - info.clientHeight + 3);
}

var inputJsonEditor = CodeMirror.fromTextArea
	(document.getElementById('inputJson'), {
		mode: "application/ld+json",
		theme: "dracula",
		lineNumbers: true,
		lineWrapping: true,
		scrollbarStyle: "simple",
		extraKeys: {
			"F11": function (cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function (cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
		}
	});
//inputJsonEditor.setSize(textareaWidth, textareaHeight);
var where = 'bottom';
var numPanels = 0;
var panels = {};
function makePanel(where, editorName) {
	var node = document.createElement("div");
	var id = ++numPanels;
	var label;
	node.id = "panel-" + id;
	node.className = "panel " + where;
	var buttonNode = document.createElement("button");
	buttonNode.className = "controls__button controls__button--minify";
	buttonNode.onclick = function () {
		copyJson(editorName);
	};
	label = node.appendChild(buttonNode);
	label.innerHTML = "Copy " + editorName;
	return node;
}
function addPanel(where) {
	var node1 = makePanel(where, "Input JSON");
	var node2 = makePanel(where, "JSON Schema");
	panels[node1.id] = inputJsonEditor.addPanel(node1, { position: where, stable: true });
	panels[node2.id] = jsonSchemaEditor.addPanel(node2, { position: where, stable: true });
}
//addPanel(where);
inputJsonEditor.setSize("100%", "100%");
jsonSchemaEditor.setSize("100%", "100%");

function isNumeric(str) {
	return false;
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function clearJsons() {
	jsonSchemaEditor.getDoc().setValue("");
	inputJsonEditor.getDoc().setValue("");
}
function wrapJsons() {
	jsonSchemaEditor.setOption("lineWrapping", true);
	inputJsonEditor.setOption("lineWrapping", true);
}
function unwrapJsons() {
	jsonSchemaEditor.setOption("lineWrapping", false);
	inputJsonEditor.setOption("lineWrapping", false);
}
function minifyJsons() {
	try {
		var temp1 = inputJsonEditor.getDoc().getValue();
		var minifiedTemp1 = JSON.stringify(JSON.parse(temp1));
		inputJsonEditor.getDoc().setValue(minifiedTemp1);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	} try {
		var temp2 = jsonSchemaEditor.getDoc().getValue();
		var minifiedTemp2 = JSON.stringify(JSON.parse(temp2));
		jsonSchemaEditor.getDoc().setValue(minifiedTemp2);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	}
}

function beautifyJsons() {
	try {
		var temp1 = inputJsonEditor.getDoc().getValue();
		var minifiedTemp1 = JSON.stringify(JSON.parse(temp1), null, 2);
		inputJsonEditor.getDoc().setValue(minifiedTemp1);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	}
	try {
		var temp2 = jsonSchemaEditor.getDoc().getValue();
		var minifiedTemp2 = JSON.stringify(JSON.parse(temp2), null, 2);
		jsonSchemaEditor.getDoc().setValue(minifiedTemp2);
	} catch (err) {
		console.log("Unable to parse jsonSchema Editor");
	}
}


function getKeyObjectTypes(obj, tab) {
	//console.log("calling getKeyObjectTypes")
	var propertyname = "";
	var jsonSchemaArray = []
	var propertyArray = []
	for (var attributename in obj) {
		var jsonSchema = {}
		//console.log("Entered for loop")
		propertyname = attributename;

		key = obj[attributename]
		//console.log(tab+"attributename = "+attributename)
		var objectType = typeof key
		if (objectType == 'object') {
			if (Array.isArray(key)) {
				var returnValues = getKeyObjectTypes(key, tab + "	")
				var tempPropArray = returnValues[0]
				var tempJsonArray = returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if (tempJsonArray[i]['type'] == 'string') {
						jsonSchema['type'] = "string"
						jsonSchema['title'] = attributename
						jsonSchema['description'] = ""
						jsonSchema['multiValued'] = "true"
						jsonSchema['value'] = ""
					} else if (tempJsonArray[i]['type'] == 'number') {
						jsonSchema['type'] = "number"
						jsonSchema['title'] = attributename
						jsonSchema['description'] = ""
						jsonSchema['multiValued'] = "true"
						jsonSchema['value'] = ""
					} else {
						jsonSchema['type'] = "json array"
						jsonSchema['title'] = attributename
						jsonSchema['description'] = "<description of " + attributename + ">"
						jsonSchema['static'] = "true"
						jsonSchema['multiValued'] = "false"
						jsonSchema['value'] = ""
						if (jsonSchema['properties'] == null) {
							jsonSchema['properties'] = {}
						}
						jsonSchema['properties'] = tempJsonArray[i]['properties']
						console.log(tempJsonArray[i]['properties'])
					}
					jsonSchemaArray.push(jsonSchema)
					//propertyArray.push(tempPropArray[i])
					propertyArray.push(attributename)

				}

				//return [attributename,jsonSchema]
			} else {
				jsonSchema['type'] = "json object"
				jsonSchema['title'] = attributename
				jsonSchema['description'] = "<description of " + attributename + ">"
				jsonSchema['static'] = "true"
				jsonSchema['multiValued'] = "false"
				jsonSchema['value'] = ""

				var returnValues = getKeyObjectTypes(key, tab + "	")
				var tempPropArray = returnValues[0]
				var tempJsonArray = returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if (jsonSchema['properties'] == null) {
						jsonSchema['properties'] = {}
					}
					jsonSchema['properties'][tempPropArray[i]] = tempJsonArray[i]
					//return [attributename,jsonSchema]
					if (!isNumeric(attributename)) {
						jsonSchemaArray.push(jsonSchema)
						propertyArray.push(attributename)
					}
				}
			}
		} else if (objectType == 'string') {
			jsonSchema['type'] = "string"
			jsonSchema['title'] = attributename
			jsonSchema['description'] = ""
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType == 'number') {
			jsonSchema['type'] = "number"
			jsonSchema['title'] = attributename
			jsonSchema['description'] = ""
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType == 'boolean') {
			jsonSchema['type'] = "boolean"
			jsonSchema['title'] = attributename
			jsonSchema['description'] = ""
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else {
			////console.log(tab+"objectType")
		}

		//jsonSchemaArray.push(jsonSchema)
	}
	console.log("----->" + propertyArray)
	//console.log("=====>"+JSON.stringify(jsonSchemaArray))
	return [propertyArray, jsonSchemaArray]
}

function copyJSONSchema() {
	/* Get the text field */

	var copyText = jsonSchemaEditor.getDoc().getValue();
	navigator.clipboard.writeText(copyText);
}
function copyJson(editorName) {
	/* Get the text field */
	if (editorName == "JSON Schema") {
		var copyText = jsonSchemaEditor.getDoc().getValue();
		navigator.clipboard.writeText(copyText);
	} else if (editorName == "Input JSON") {
		var copyText = inputJsonEditor.getDoc().getValue();
		navigator.clipboard.writeText(copyText);
	}

}
function generateJsonSchema() {
	console.log("generate");
	var inputJson = inputJsonEditor.getDoc().getValue();
	console.log(inputJson);
	const obj = JSON.parse(inputJson);

	var jsonSchemaBuilder = {}
	jsonSchemaBuilder['title'] = "<Enter title here>"
	jsonSchemaBuilder['description'] = "<Enter description here>"
	jsonSchemaBuilder['type'] = "object"
	jsonSchemaBuilder['schemaType'] = "static"
	jsonSchemaBuilder['required'] = []
	jsonSchemaBuilder['domainObjects'] = ["user"]
	jsonSchemaBuilder['properties'] = {}
	var returnValues = getKeyObjectTypes(obj, tab);
	var tempPropArray = returnValues[0]
	var tempJsonArray = returnValues[1]
	for (let i = 0; i < tempJsonArray.length; i++) {
		jsonSchemaBuilder['properties'][tempPropArray[i]] = tempJsonArray[i]
	}
	var generatedJsonSchema = JSON.stringify(jsonSchemaBuilder, null, 2);
	//document.getElementById("jsonSchemaArea").value=generatedJsonSchema;

	jsonSchemaEditor.getDoc().setValue(generatedJsonSchema);

}