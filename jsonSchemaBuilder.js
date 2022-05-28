var tab = '';
function isNumeric(str) { return false;
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
function getKeyObjectTypes(obj,tab){
	//console.log("calling getKeyObjectTypes")
	var propertyname = "";
	var jsonSchemaArray = []
	var propertyArray = []
	for(var attributename in obj) {
		var jsonSchema = {}
		//console.log("Entered for loop")
		propertyname = attributename;
		
		key = obj[attributename]
		//console.log(tab+"attributename = "+attributename)
		var objectType = typeof key
		if(objectType=='object'){
			if(Array.isArray(key)){
				var returnValues = getKeyObjectTypes(key,tab+"	")
				var tempPropArray = returnValues[0]
				var tempJsonArray=returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if(tempJsonArray[i]['type']=='string'){
						jsonSchema['type'] ="string"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="true"
						jsonSchema['value']=""
					} else if(tempJsonArray[i]['type']=='number'){
						jsonSchema['type'] ="number"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="true"
						jsonSchema['value']=""
					}else{
						jsonSchema['type'] ="json array"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="false"
						jsonSchema['value']=""
						if(jsonSchema['properties']== null){
							jsonSchema['properties']={}
						}
						jsonSchema['properties']=tempJsonArray[i]['properties']
						console.log(tempJsonArray[i]['properties'])
					}
						jsonSchemaArray.push(jsonSchema)
						//propertyArray.push(tempPropArray[i])
						propertyArray.push(attributename)
					
				}
				
				//return [attributename,jsonSchema]
			} else{
				jsonSchema['type'] ="json object"
				jsonSchema['title']=attributename
				jsonSchema['multiValued']="false"
				jsonSchema['value']=""
				
				var returnValues = getKeyObjectTypes(key,tab+"	")
				var tempPropArray = returnValues[0]
				var tempJsonArray=returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if(jsonSchema['properties']== null){
						jsonSchema['properties']={}
					}
					jsonSchema['properties'][tempPropArray[i]]=tempJsonArray[i]
					//return [attributename,jsonSchema]
					if(!isNumeric(attributename)){
						jsonSchemaArray.push(jsonSchema)
						propertyArray.push(attributename)
					}
				}
			}
		} else if (objectType=='string'){
			jsonSchema['type'] ="string"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType=='number'){
			jsonSchema['type'] ="number"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType=='boolean'){
			jsonSchema['type'] ="boolean"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else {
			////console.log(tab+"objectType")
		}
		
		//jsonSchemaArray.push(jsonSchema)
	}
	console.log("----->"+propertyArray)
	//console.log("=====>"+JSON.stringify(jsonSchemaArray))
	return [propertyArray,jsonSchemaArray]
}
function copyJSONSchema() {
  /* Get the text field */
  var copyText = document.getElementById("jsonSchemaArea");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 9999999); /* For mobile devices */

   /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);
}
function generateJsonSchema(){
	console.log("generate");
	var inputJson = document.getElementById("inputJson").value;
	console.log(inputJson);
	const obj = JSON.parse(inputJson);

	var jsonSchemaBuilder = {}
	jsonSchemaBuilder['title'] ="<Enter title here>"
	jsonSchemaBuilder['description']="<Enter description here>"
	jsonSchemaBuilder['type']="object"
	//jsonSchemaBuilder['schemaType']="static"
	jsonSchemaBuilder['required']=[]
	jsonSchemaBuilder['domainObjects']=["user"]
	jsonSchemaBuilder['properties'] = {}
	var returnValues = getKeyObjectTypes(obj,tab);
	var tempPropArray = returnValues[0]
	var tempJsonArray=returnValues[1]
	for (let i = 0; i < tempJsonArray.length; i++) {
		jsonSchemaBuilder['properties'][tempPropArray[i]]=tempJsonArray[i]
	}
	var generatedJsonSchema = JSON.stringify(jsonSchemaBuilder, null, 2);
	document.getElementById("jsonSchemaArea").value=generatedJsonSchema;
}