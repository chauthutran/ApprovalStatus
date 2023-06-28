
// -------------------------------------------
// -- Utility Class/Methods

function Util() {}

Util.disableTag = function( tag, isDisable )
{
	tag.prop('disabled', isDisable);
	
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		if( element.prop("tagName") == 'SELECT' || element.prop("tagName") == 'INPUT' )
		{
			if( isDisable )
			{
				element.css( 'background-color', '#F2F2F2' ).css( 'cursor', 'auto' );
			}
			else
			{
				element.css( 'background-color', 'white' ).css( 'cursor', '' );
			}
		}
	}
};


// ----------------------------------
// Seletet Tag Populate, Etc Related

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.clearList = function( selector ) {
	selector.children().remove();
};

// Seletet Tag Populate, Etc Related
// ----------------------------------



// ----------------------------------
// Check Variable Related


Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};

// Check Variable Related
// ----------------------------------



// ----------------------------------
// Date


var monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
Util.formatDate = function( dateTimeStr )
{
	var arrDateTime = [];
	if( dateTimeStr.indexOf("T")>=0 ) 
	{
		arrDateTime = dateTimeStr.split("T");
	}
	else 
	{
		arrDateTime = dateTimeStr.split(" ");
	}
	
	var attDate = arrDateTime[0].split("-");
	var arrTime = arrDateTime[1].split(":");
	var monthIdx = eval(attDate[1]) - 1;

	return attDate[0] + " " + monthShortNames[monthIdx] + " " + attDate[2] + "  " + arrTime[0] + ":" + arrTime[1];
};

// Date
// ----------------------------------




