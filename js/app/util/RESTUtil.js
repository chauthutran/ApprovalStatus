
function RESTUtil() {}

RESTUtil.getAsyncData = function( url, actionSuccess, doneFunc, actionError ) 
{
	return $.ajax({
		type: "GET"
		,dataType: "json"
		,url: url
		,async: true
		,success: actionSuccess
		,error: actionError
	})
	.always( function( data ) {
		if ( doneFunc !== undefined ) doneFunc();
	});
}



RESTUtil.getSynchData = function( url ) {
	return $.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		async: false
	}).responseText;
};



// End of Data Retrieval Manager Class
// ------------------------------------------------------------
