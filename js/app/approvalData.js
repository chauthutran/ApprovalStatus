
// ------------------------------------
// *** DHIS AppStore Deploy Version ***
// -- App Manifest Json (Get this via Synch, so that it is defined ahead)
var _appManifest = $.parseJSON( RESTUtil.getSynchData( 'manifest.webapp' ) );
// -- URLs
var _appURL = _appManifest.activities.dhis.href.replace( '/dhis-web-maintenance-appmanager', '' ) + '/';
// ------------------------------------

var _queryURL_api = _appURL + 'api/';

var SUPER_USER_ROLE = "M7829GUPC5B"; // _CORE - Superuser

// -----------------------------------------------------------------------------
// -- Form Events
// ---------

jQuery( document ).ready( function() {

	// Preload some processes and start FormAction class (the main class)
	var preloadProcessorManager = new PreloadProcessManager( function( period_UI, orgUnit_DM )
	{
		var app = new ApprovalData( period_UI, orgUnit_DM );		
	});

});

function ApprovalData( period_UI, orgUnit_DM )
{
	var me = this;
	
	me.period_UI = period_UI;
	me.orgUnit_DM = orgUnit_DM;

	me.PARAM_SQL_VIEW_GET_ORGUNIT_BY_LEVEL = "L17dE9xR0Yw";
	me.PARAM_SQL_VIEW_APPROVOVE_DATA = "xI1fKiXGUoV";
	me.PARAM_SQL_VIEW_USER_NAMES = "Q06EUmdZUSL";
	
	me.PARAM_LEVEL = "@PARAM_LEVEL";
	me.PARAM_PERIOD_TYPE_NAME = "@PARAM_PERIOD_TYPE_NAME";
	me.PARAM_SELECTED_OU_LEVEL = "@PARAM_SELECTED_OU_LEVEL";
	me.PARAM_SELECTED_OU_ID = "@PARAM_SELECTED_OU_ID";
	me.PARAM_LEVEL_ID = "@PARAM_LEVEL_ID";
	me.PARAM_START_DATE = "@PARAM_START_DATE";
	me.PARAM_END_DATE = "@PARAM_END_DATE";
	
	me._queryURL_OrgUnit_By_Level = _queryURL_api + "sqlViews/" + me.PARAM_SQL_VIEW_GET_ORGUNIT_BY_LEVEL + "/data.json?var=level:" + me.PARAM_LEVEL + "&var=periodTypeName:" + me.PARAM_PERIOD_TYPE_NAME + "&var=ouLevel:" + me.PARAM_SELECTED_OU_LEVEL + "&var=ouId:" + me.PARAM_SELECTED_OU_ID;
	me._queryURL_Approve_Data = _queryURL_api + "sqlViews/" + me.PARAM_SQL_VIEW_APPROVOVE_DATA + "/data.json?var=dataLevel:" + me.PARAM_LEVEL_ID + "&var=startDate:" + me.PARAM_START_DATE + "&var=endDate:" + me.PARAM_END_DATE;
	me._queryURL_User_Names = _queryURL_api + "sqlViews/" + me.PARAM_SQL_VIEW_USER_NAMES + "/data.json";
	
	me.levelTag = $( "#level" );
	me.periodTypeTag = $( "#periodType" );
	me.periodTag = $( "#periodList" );
	me.approvedFilterTag = $( "#approvedFilter" );
	me.acceptedFilterTag = $( "#acceptedFilter" );
	me.runBtnTag = $( "#runBtn" );
	me.dataListingDivTag = $( "#dataListingDiv" );
	me.dataListingTbTag = $( "#dataListingTb" );
	me.loaderDivTag = $( "#loaderDiv" );
	me.progressDivTag = $( "#progressDiv" );
	me.errorMessageTag = $( "#errorMessage" );
		
	me.sortPerformedBefore = false;
		
	me.initialSetup = function()
	{
		me.errorMessageTag.hide();
		Util.disableTag( me.runBtnTag, true );
		me.setup_Event();
	};
	
	me.setup_Event = function()
	{
		me.runBtnTag.click( function(){
			me.run();
		});
		
		me.periodTypeTag.change( function()
		{
			Util.disableTag( me.runBtnTag, !me.enableRuning() );
		});
		
		me.periodTag.change( function()
		{
			Util.disableTag( me.runBtnTag, !me.enableRuning() );
		});
		
		me.approvedFilterTag.change( function()
		{
			me.filterDataAndMergeCell();
		});
		
		me.acceptedFilterTag.change( function()
		{
			me.filterDataAndMergeCell();
		});
	
	};
	
	me.enableRuning = function()
	{
		return ( me.periodTypeTag.val() !== "" && me.periodTag.val() !== null && me.periodTag.val() !== "" && me.orgUnit_DM.getSelected().length > 0 )
	};
	
	me.run = function()
	{
		me.errorMessageTag.hide();
		me.dataListingDivTag.hide();
		me.progressDivTag.html("Retrieving data");
		me.loaderDivTag.show();
		
		var level = me.levelTag.val();
		var levelId = me.levelTag.find( "option:selected").attr( "levelId" );
		var periodTypeName = me.periodTypeTag.val();
		var startDate = me.period_UI.getPeriodStartDate();
		var endDate = me.period_UI.getPeriodEndDate();
		
		me.loadedOrgUnits = false;
		me.ouDataSetList = [];
		me.loadedApprovalData = false;
		me.approvalData = [];
		me.loadedUserList = false;
		me.userList = [];
		var selectedOu = me.orgUnit_DM.getSelected()[0];
		
		// Retrieve Orgunits ( include descendants children ) with dataSets( approval data as TRUE ) by selected level	
		me.getOrgUnitsByLevel( level, selectedOu.level, selectedOu.id, periodTypeName );
		
		// Retrieve Approval data by selected level
		me.getApprovalData( levelId, startDate, endDate );
		
		// Retrieve User names
		me.getUserInfor();
		
	};
	
	me.getOrgUnitsByLevel = function( approvalLevel, selectedOuLevel, selectedOuId, periodTypeName )
	{
		var url = me._queryURL_OrgUnit_By_Level;
		url = url.replace( me.PARAM_LEVEL, approvalLevel );	
		url = url.replace( me.PARAM_PERIOD_TYPE_NAME, periodTypeName );
		url = url.replace( me.PARAM_SELECTED_OU_LEVEL, selectedOuLevel );
		url = url.replace( me.PARAM_SELECTED_OU_ID, selectedOuId );
	
		RESTUtil.getAsyncData( url ,function( json_Data )
		{
			me.ouDataSetList = json_Data.listGrid.rows;
		}, function(){
			me.loadedOrgUnits = true;
			me.createTableAndPopulateData();
		});
	};
	
	me.getApprovalData = function( levelId, startDate, endDate )
	{
		var url = me._queryURL_Approve_Data;
		url = url.replace( me.PARAM_LEVEL_ID, levelId );	
		url = url.replace( me.PARAM_START_DATE, startDate );
		url = url.replace( me.PARAM_END_DATE, endDate );
	
		RESTUtil.getAsyncData( url ,function( json_Data )
		{
			me.approvalData = json_Data.listGrid.rows;
		}, function(){
			me.loadedApprovalData = true;
			me.createTableAndPopulateData();
		});
	};
	
	me.getUserInfor = function()
	{
		var url = me._queryURL_User_Names
		RESTUtil.getAsyncData( url ,function( json_Data )
		{
			me.userList = me.convertUserListToArray( json_Data.listGrid.rows );
		}, function(){ 
			me.loadedUserList = true;
			me.createTableAndPopulateData();
		}
		, function(){
			me.userList = [];
			me.errorMessageTag.show();
		});
	};
	
	me.convertUserListToArray = function( userList )
	{
		var list = [];
		for( var i = 0; i<userList.length; i++ )
		{
			var id = userList[i][0];
			var name = userList[i][1];			
			list[id] = name;
		}
		return list;
	};
	
	me.checkDataLoaded = function()
	{
		return ( me.loadedOrgUnits && me.loadedApprovalData && me.loadedUserList );
	};
	
	me.createTableAndPopulateData = function()
	{
		if( me.checkDataLoaded() )
		{
			// Clear data in table
			
			var tbody = me.dataListingDivTag.find( "tbody" );
			tbody.html( "" );
			
			// STEP 1. Generate table		
			me.createTable( tbody, me.ouDataSetList );
			
			// STEP 2. Populate approval data		
			me.populateApprovalData( tbody, me.approvalData );
			
			// STEP 3. Populate User names who approved data	
			me.populateUsername( tbody, me.userList );
			
			// STEP 4. Sort data in table by Orgunit Or dataset
			me.makeTableSortable( me.dataListingTbTag );
			
			// STEP 5. Filter data in table && Merge the cells which are the same Org Unit Name			
			me.filterDataAndMergeCell();
			
			// Hide loading tag
			me.loaderDivTag.hide();
			
			// Show Data listing div
			me.dataListingDivTag.show();
		}
	}
	
	me.createTable = function( tbody, ouDataSetList )
	{
		// Init default values for approved and accepted columns
		var approved = "Unapproved";
		var accepted = "";
		
		
		for( var i=0; i<ouDataSetList.length; i++ )
		{	
			// Col 0 : Org Unit Id in selected Level
			// Col 1 : Data Set Id
			// Col 3 : Org Uni Name in selected Level
			// Col 2 : Data Set Name
			
			var ouId = ouDataSetList[i][0];
			var dsId = ouDataSetList[i][1];
			var ouName = ouDataSetList[i][2];
			var dsName = ouDataSetList[i][3];
			
			var id = "data_" + ouId + "_" + dsId;
			
			var rowTag = $( "<tr approved='" + approved + "' accepted='" + accepted + "'></tr>" );
			rowTag.append( "<td ouName='" + ouName + "'>" + ouName + "</td>" );
			rowTag.append( "<td>" + dsName + "</td>" );
			rowTag.append( "<td id='" + id + "_approved' style='color:red;'>" + approved + "</td>" );
			rowTag.append( "<td id='" + id + "_accepted' style='color:red;'>" + accepted + "</td>" );
			
			tbody.append( rowTag );
		}
		
	};
	
	
	me.populateApprovalData = function( tbody, approvalData )
	{
		// Set "Approved" data for all row in this result
		var approved = "Approved";
		
		for( var i=0; i<approvalData.length; i++ )
		{
			// Col 0 : Org Unit Id
			// Col 1 : Data Set Id
			// Col 2 : Accepted
			// Col 3 : UserId who approved data
			// Col 4 : Date where data approved
			
			var ouId = approvalData[i][0];
			var dsId = approvalData[i][1];
			var accepted = me.convertBoolValue( approvalData[i][2] );
			var who = approvalData[i][3];
			var date = Util.formatDate( approvalData[i][4] );
	
			var id = "data_" + ouId + "_" + dsId;
			
			// Update 'approved' infor.
			var approvedTag = tbody.find("td[id='" + id + "_approved']")
			approvedTag.html( approved );
			approvedTag.css( "color", "darkgreen" );
			
			var rowTag = approvedTag.closest( "tr" )
			rowTag.attr( "approved", approved );
			
			// Update 'accepted' infor.
			var acceptedTag = tbody.find("td[id='" + id + "_accepted']")
			acceptedTag.html( accepted );
			var color = ( accepted == "Accepted" ) ? "darkgreen" : "red";
			acceptedTag.css( "color", color );
			rowTag.attr( "accepted", accepted );
			
			// Update 'user' infor.
			rowTag.attr( "userId", who );
			rowTag.attr( "date", date );
			rowTag.attr( "title", "Data approved on " + date );
		}
	};
	
	me.populateUsername = function( tbody, userList )
	{
		if( userList.length > 0 )
		{
			tbody.find( "tr[userId]" ).each( function()
			{
				var rowTag = $( this );
				var userId = rowTag.attr( "userId" );
				var userName = me.userList[userId];
				if( userName !== undefined )
				{
					var date = rowTag.attr( "date" );
					rowTag.attr( "title", "'" + userName + "' approved data on " + date );
				}
			});
		}
	};
	
	me.filterDataAndMergeCell = function()
	{
		me.filterData();
		me.mergeCell();
	}
	
	me.filterData = function()
	{
		var approvedOpt = me.approvedFilterTag.val();
		var acceptedOpt = me.acceptedFilterTag.val();
		
		me.dataListingTbTag.find( "tbody tr" ).attr( "filter", "false" ).hide();
		
		var rowTags;
		if( approvedOpt == "all" && acceptedOpt == "all")
		{
			rowTags = me.dataListingTbTag.find( "tbody tr" ).attr( "filter", "true" );
		}
		else if( approvedOpt == "all" || acceptedOpt == "all")
		{
			if( approvedOpt == "all" )
			{
				rowTags = me.dataListingTbTag.find( "tbody tr[accepted='" + acceptedOpt + "']" )
			}
			else
			{
				rowTags = me.dataListingTbTag.find( "tbody tr[approved='" + approvedOpt + "']" )
			}
		}
		else
		{
			rowTags = me.dataListingTbTag.find( "tbody tr[accepted='" + acceptedOpt + "'][approved='" + approvedOpt + "']" );
		}
		
		rowTags.attr( "filter", "true" ).show();
	};
	
	me.mergeCell = function()
	{
		var tbody = me.dataListingDivTag.find( "tbody" );
		tbody.find( "tr td:nth-child(1)" ).removeClass( "mergeFirstCell" );
		tbody.find( "tr td:nth-child(1)" ).removeClass( "mergeCell" );
		
		var prevOuName = "";
		var prevCell;
		
		tbody.find( "tr[filter='true'] td:nth-child(1)" ).each( function()
		{
			var cell = $( this );
			var ouName = cell.attr( "ouName" );
			cell.html( ouName );
			if( ouName == prevOuName )
			{
				cell.addClass( "mergeCell" );
				prevCell.addClass( "mergeFirstCell" );
				cell.html( "" );
			}
			else
			{
				prevOuName = ouName;
				prevCell = cell;
				
				cell.html( ouName );
			}
		});
	};
	
	me.convertBoolValue = function( value )
	{
		if( value == "" ) return value;
		
		return ( value == 'true' ) ? "Accepted" : "Pending";
	};
	
	me.makeTableSortable = function( table )
	{
		var sortingList = { 'sortList': [[0,0],[1,0]] };
		
		( me.sortPerformedBefore ) ? table.trigger( "updateAll", [ sortingList, function() {} ] ) : table.tablesorter( sortingList );
		
		me.sortPerformedBefore = true;	

		table.bind("sortEnd",function(e, t){
			me.mergeCell( table.find( "tbody" ) );
		});

	};
	
	me.initialSetup();
	
}


