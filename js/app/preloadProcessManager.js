
function PreloadProcessManager( afterExecuteFunc )
{
	var me = this;

	me.period_UI;
	me.orgUnit_DM;

	me.status_OrgUnit_Level = false;
	me.status_Period = false;

	me.afterExecuteFunc = afterExecuteFunc;


	// -----------------------------------------------

	me.checkAllProcessFinished = function()
	{
		return ( me.status_OrgUnit_Level && me.status_Period );
	};

	me.preLoadProcess = function()
	{
		// Start the form hiding
		MsgManager.appBlock( "Preload Step Processing" );

		me.period_UI.performSetup( function()
		{
			me.status_Period = true;
			
			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.period_UI, me.orgUnit_DM );
			}
		});
		
		me.orgUnit_DM.performSetup( function()
		{
			me.status_OrgUnit_Level = true;

			if ( me.checkAllProcessFinished() )
			{
				MsgManager.appUnblock();

				me.afterExecuteFunc( me.period_UI, me.orgUnit_DM );
			}
		});
		

	};


	// ------------------------------------------------
	// -- Initial Setup Related

	me.initialSetup = function()
	{
		me.orgUnit_DM = new OrgUnit_DM();
		me.period_UI = new Period_UI( new Period_DM() );
		
		me.preLoadProcess();
	};


	// Initial Setup Call
	me.initialSetup();
}
