/**
 * Created by Tran on 8/5/2015.
 */


function OrgUnit_DM()
{
    var me = this;
	
	me._queryURL_Approval_Data_OrgUnit_Level = _queryURL_api + "dataApprovalLevels.json?paging=false&fields=id,orgUnitLevel,name";
    me.selected = [];

    me.levelTag = $( "#level" );
	me.periodTypeTag = $( "#periodType" );
	me.periodTag = $( "#periodList" );
    me.runBtnTag = $("#runBtn");
	
    me.initialSetup = function(){
        me.buildTree();
    };

    me.buildTree = function()
    {
        selectionTreeSelection.setMultipleSelectionAllowed( false );
        selectionTree.clearSelectedOrganisationUnits();
        selectionTree.buildSelectionTree();

        selectionTreeSelection.setListenerFunction( me.listenerFunction );
    };

    me.listenerFunction = function( orgUnits, orgUnitNames )
    {
        me.selected = [];
        var selectedNames = "";
        for( var i=0; i< orgUnits.length; i++) {
			var ouId = orgUnits[i];
            me.selected.push( { "id": ouId, "name": orgUnitNames[i], "level": me.getSelectedOuLevel( ouId ) } );
            selectedNames += orgUnitNames[i] + "; ";
        }
		
		Util.disableTag( me.runBtnTag, !me.enableRuning() );
    };
	
	
	me.enableRuning = function()
	{
		return ( me.periodTypeTag.val() !== "" && me.periodTag.val() !== null && me.periodTag.val() !== "" && me.getSelected().length > 0 )
	};
	
	
	me.getSelectedOuLevel = function( ouId )
	{
		var key = "oustOrgUnit" + ouId;
		var level = 1;
		var ulTag = $( "#" + key ).closest( "ul" ).parent().closest("ul");
		while( ulTag.length > 0 )
		{
			level++;
			ulTag = ulTag.parent().closest("ul");
		}
		
		return level;
	};
	
    me.getSelected = function()
    {
        return me.selected;
    };
	
	me.performSetup = function( returnFunc )
	{
		me.levelTag.empty();
		
		RESTUtil.getAsyncData( me._queryURL_Approval_Data_OrgUnit_Level
			,function(json)
			{
				var list = json.dataApprovalLevels;
				
				for( var i=0; i<list.length; i++ )
				{
					me.levelTag.append( '<option levelId="' + list[i].id + '" value="' + list[i].orgUnitLevel + '">' + list[i].name + '</option>' );
				}								
				returnFunc();
			}
		);
	};
	
	// -------------------------------------------------------------------------------------
	
	me.initialSetup();
}

