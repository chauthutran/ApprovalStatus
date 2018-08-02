/**
 * Created by Tran on 8/5/2015.
 */


var _queryURL_Period_Type = _queryURL_api + "organisationUnitLevels.json?paging=false&fields=id,name,level";

function Period_UI( period_DM )
{
    var me = this;

    me.period_DM = period_DM;
    me.periodTypeTag = $( "#periodType" );
    me.periodListTag = $( "#periodList" );
	
    me.initialSetup = function()
    {
        me.setup_Event();
    };

    me.setup_Event = function()
    {
        me.periodTypeTag.change( function()
		{
            var periodType = me.periodTypeTag.val();
            Util.clearList( me.periodListTag );

            if( periodType!= "" ){
                me.generatePeriodList( periodType );
                Util.disableTag( me.periodListTag, false );
            }
            else
            {
                Util.disableTag( me.periodListTag, true );
            }
        });

    };

    me.performSetup = function( returnFunc )
    {
        me.period_DM.getAllPeriodType( function( periodTypes )
		{
            me.periodTypeTag.removeClass( "option-loading" );
            Util.clearList( me.periodTypeTag );

            if( periodTypes.length > 0 ) {
                me.periodTypeTag.append( "<option value=''>[Please select]</option>" );
                for (var i in periodTypes) {
                    var periodType = periodTypes[i];
                    me.periodTypeTag.append( "<option value='" + periodType + "'>" + periodType + "</option>" );
                }
            }
            else
            {
                me.periodTypeTag.append( "<option value=''>[No Period Type]</option>" );
            }
            Util.disableTag( me.periodTypeTag, false );
			
			returnFunc();
        });
    };

    me.generatePeriodList = function( periodType )
    {
        Util.clearList( me.periodListTag );
        me.periodListTag.append( "<option value=''>[Please select]</option>" );

        var periodList = me.period_DM.generatePeriodList(periodType);
        for( var i=0; i<periodList.length; i++ )
        {
            var value = periodList[i].value;
            var name = periodList[i].name;
            me.periodListTag.append( "<option value='" + value + "'>" + name + "</option>" );
        }
    };

    me.getPeriodStartDate = function()
    {
        var periodType = me.periodTypeTag.val();
        var value = me.periodListTag.val();
        if( periodType != "" && value != "" ) 
		{
            return me.period_DM.getStartDate( periodType, value );
        }

        return "";
    };

    me.getPeriodEndDate = function()
    {
        var periodType = me.periodTypeTag.val();
        if( periodType != "" ) {
            var value = me.periodListTag.val();
            return me.period_DM.getEndDate( periodType, value );
        }

        return "";
    };

    me.getDateParam = function( dateVal ){
        return dateVal.replace( /-/g, '' );
    };

    me.getPeriodFromType = function( periodType, startDate )
    {
        return me.period_DM.getPeriodFromType( periodType, startDate );
    }

	me.initialSetup();
}

function Period_DM()
{
    var me = this;
    me.periodType = [ "Yearly", "SixMonthly", "Quarterly", "Monthly", "Weekly" ];
    me.sixMonthlyNames = [ "Jan - Jun", "Jul - Dec" ];
    me.quarterlyNames = [ "Jan - Mar", "Apr - Jun", "Jul - Sep", "Oct - Dec" ];
    me.monthlyNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    me.START_YEAR_PARAM = 2012;
    me.DATE_FORMAT = "yyyy-mm-dd";

    me.getAllPeriodType = function( returnFunc ){
        returnFunc( me.periodType );
    };

    me.generatePeriodList = function( periodType )
    {
        if( periodType == "Yearly" ){
            return me.generateYearlyPeriodList();
        }
        else if( periodType == "SixMonthly" ){
            return me.generateSixMonthlyPeriodList();
        }
        else if( periodType == "Quarterly" ) {
            return me.generateQuarterlyPeriodList();
        }
        else if( periodType == "Monthly" ){
            return me.generateMonthlyPeriodList();
        }
        else if( periodType == "Weekly" ) {
            return me.generateWeeklyPeriodList();
        }
    };

    me.getPeriodFromType = function( periodType, startDate )
    {
        var year = startDate.substr( 0,4 );
        var month = eval( startDate.substr( 5,2 ) );

        if( periodType == "Yearly" ){
            return year;
        }
        else if( periodType == "SixMonthly" ){
            return ( month <= 6) ? me.sixMonthlyNames[0] + " " + year : me.sixMonthlyNames[1] + " " + year ;
        }
        else if( periodType == "Quarterly" ) {
           var idx = Math.floor( month/3 );
           return me.quarterlyNames[idx] + " " + year;
        }
        else if( periodType == "Monthly" ){
            return me.monthlyNames[month--] + " " + year;
        }
        else if( periodType == "Weekly" ) {
            return "";
        }
    };

    me.getStartDate = function( periodType, value ){
        if( periodType == "Yearly" ){
            return value + "-01-01";
        }
        else if( periodType == "SixMonthly" ){
            var idx = value.substr( 0,1 );
            var year = value.substr( 2,4 );
            return ( idx == "1" ) ? year + "-01-01" : year + "-07-01";
        }
        else if( periodType == "Quarterly" ) {
            var idx = eval( value.substr( 0,1 ) );
            var year = value.substr( 2,4 );
            switch ( idx ){
                case 1: return year + "-01-01";
                case 2: return year + "-04-01";
                case 3: return year + "-07-01";
                case 4: return year + "-10-01";
            }
        }
        else if( periodType == "Monthly" ){
            var year = eval( value.substr( 0,4 ) );
            var month = eval( value.substr( 4,2 ) );
            month = ( month < 10 ) ? "0" + month : month;
            return year + "-" + month + "-01";
        }
        else if( periodType == "Weekly" ) {
            // return me.generateWeeklyPeriodList();
        }
    };

    me.getEndDate = function( periodType, value ){
        if( periodType == "Yearly" )
		{
            return value + "-12-31";
        }
        else if( periodType == "SixMonthly" )
		{
            var idx = value.substr( 0,1 );
            var year = value.substr( 2,4 );
            return ( idx == "1" ) ? year + "-06-30" : year + "-12-31";
        }
        else if( periodType == "Quarterly" ) 
		{
            var idx = eval( value.substr( 0,1 ) );
            var year = value.substr( 2,4 );
            switch ( idx )
			{
                case 1: return year + "-03-31";
                case 2: return year + "-06-30";
                case 3: return year + "-09-30";
                case 4: return year + "-12-31";
            }
        }
        else if( periodType == "Monthly" )
		{
            var year = eval( value.substr( 0,4 ) );
            var month = eval( value.substr( 4,2 ) ); // next month
            var date = new Date( year, month, 0 );

            month = ( month < 10 ) ? "0" + month : month;
            return year + "-" + month + "-" + date.getDate();
        }
        else if( periodType == "Weekly" ) 
		{
            // return me.generateWeeklyPeriodList();
        }
    };

    me.generateYearlyPeriodList = function()
    {
        var periodList = [];
        var curDate = new Date();
        var curYear = curDate.getFullYear();
        for( var year=curYear; year>=me.START_YEAR_PARAM; year-- )
		{
            var period = { "value": year, "name": year };
            periodList.push( period );
        }

        return periodList;
    };

    me.generateSixMonthlyPeriodList = function()
    {
        var periodList = [];
        var curDate = new Date();
        var year = curDate.getFullYear();
        var month = eval( curDate.getMonth() ) + 1;

        while( year >= me.START_YEAR_PARAM )
		{
            var idx = ( month <= 6 ) ? 1 : 2;
            for( var i = idx ; i>0; i--){
                var value = i + "-" + year;
                var name = me.sixMonthlyNames[i-1] + " " + year;
                var period = { "value": value, "name": name };
                periodList.push( period );
            }
            year--;
        }

        return periodList;
    };

    me.generateQuarterlyPeriodList = function()
    {
        var periodList = [];

        // For current month periods list

        var curDate = new Date();
        var month = eval( curDate.getMonth() ) + 1;
        var year = curDate.getFullYear();
        var quarterlyNo = 0;

        if( month <=3 ){
            quarterlyNo = 1;
        }
        else if( month <=6 ){
            quarterlyNo = 2;
        }
        else if( month <=9){
            quarterlyNo = 3;
        }
        else{
            quarterlyNo = 4;
        }

        // Current year

        for( var i=quarterlyNo; i>0; i-- )
        {
            var value = i + "-" + year;
            var name = me.quarterlyNames[i-1] + " " + year;
            var period = { "value": value, "name": name };
            periodList.push( period );
        }

        // For quarterly periods from START_YEAR_PARAM to last year

        for( var yearIdx = (year-1); yearIdx >= me.START_YEAR_PARAM; yearIdx-- )
        {
            var value = "4-" + yearIdx;
            var name = me.quarterlyNames[3] + " " + yearIdx;
            var period = { "value": value, "name": name };
            periodList.push( period );

            var value = "3-" + yearIdx;
            var name = me.quarterlyNames[2] + " " + yearIdx;
            var period = { "value": value, "name": name };
            periodList.push( period );


            var value = "2-" + yearIdx;
            var name = me.quarterlyNames[1] + " " + yearIdx;
            var period = { "value": value, "name": name };
            periodList.push( period );


            var value = "1-" + yearIdx;
            var name = me.quarterlyNames[0] + " " + yearIdx;
            var period = { "value": value, "name": name };
            periodList.push( period );
        }

        return periodList;
    };

    me.generateMonthlyPeriodList = function()
    {
        var periodList = [];
        var curDate = new Date();
        var year = curDate.getFullYear();
        var curMonth = eval( curDate.getMonth() ) + 1;

        while( year >= me.START_YEAR_PARAM )
        {
            while( curMonth>0 ) {
                var month = ( curMonth >= 10 ) ? curMonth + "" : "0" + curMonth;
                var value = year + month;
                var name = me.monthlyNames[curMonth - 1] + " " + year;
                var period = { "value": value, "name": name};

                periodList.push( period );

                curMonth --;
            }

            if (curMonth == 0) {
                curMonth = 13;
                year--;
            }
            curMonth--;
        }

        return periodList;
    };


    me.generateWeeklyPeriodList = function()
    {
        var periods = [];
        periods.push( { value: "not implement yet", name: "not implement yet" } );

       /* var year = new Date().getFullYear();
        var startDate = $.date( year + '-01-01', me.DATE_FORMAT );
        var day = startDate.date().getDay();
        var i = 0;

        if ( day == 0 ) // Sunday (0), forward to Monday
        {
            startDate.adjust( 'D', +1 );
        }
        else if ( day <= 4 ) // Monday - Thursday, rewind to Monday
        {
            startDate.adjust( 'D', ( ( day - 1 ) * -1 ) );
        }
        else
        // Friday - Saturday, forward to Monday
        {
            startDate.adjust( 'D', ( 8 - day ) );
        }

        var endDate = startDate.clone().adjust( 'D', +6 );

        // Include all weeks where Thursday falls in same year

        while ( startDate.clone().adjust( 'D', 3 ).date().getFullYear() <= year )
        {
            var period = [];
            period['startDate'] = startDate.format( me.DATE_FORMAT );
            period['endDate'] = endDate.format( me.DATE_FORMAT );
            period['name'] = 'W' + ( i + 1 ) + ' - ' + startDate.format( dateFormat ) + " - " + endDate.format( me.DATE_FORMAT );
            period['id'] = 'Weekly_' + period['startDate'];
            period['iso'] = year + 'W' + ( i + 1 );
            periods[i] = period;

            startDate.adjust( 'D', +7 );
            endDate = startDate.clone().adjust( 'D', +6 );
            i++;
        }
*/
        return periods;
    };
}


