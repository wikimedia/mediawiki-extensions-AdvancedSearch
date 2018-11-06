( function ( mw ) {
	var SearchRequest,
		SearchModel;

	QUnit.module( 'ext.advancedSearch.dm.trackingEvents.SearchRequest' );

	QUnit.testStart( function () {
		SearchModel = mw.libs.advancedSearch.dm.SearchModel;
		SearchRequest = mw.libs.advancedSearch.dm.trackingEvents.SearchRequest;
	} );

	QUnit.test( 'using search options are reflected in the tracking event', function ( assert ) {
		var searchModel = new SearchModel(),
			trackingEvent = new SearchRequest();

		searchModel.storeOption( 'plain', [ 'some', 'value' ] );
		searchModel.storeOption( 'not', 'some word' );
		trackingEvent.populateFromStoreOptions( searchModel.getOptions() );

		assert.strictEqual( trackingEvent.getEventData().plain, true, 'option "plain" is being used' );
		assert.strictEqual( trackingEvent.getEventData().not, true, 'option "not" is being used' );
		assert.strictEqual( trackingEvent.getEventData().or, false, 'option "or" is not being used' );
	} );

}( mediaWiki ) );
