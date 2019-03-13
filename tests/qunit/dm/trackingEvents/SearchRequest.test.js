( function () {
	var SearchRequest,
		SearchModel;

	QUnit.module( 'ext.advancedSearch.dm.trackingEvents.SearchRequest' );

	QUnit.testStart( function () {
		SearchModel = mw.libs.advancedSearch.dm.SearchModel;
		SearchRequest = mw.libs.advancedSearch.dm.trackingEvents.SearchRequest;
	} );

	QUnit.test( 'using search fields are reflected in the tracking event', function ( assert ) {
		var searchModel = new SearchModel(),
			trackingEvent = new SearchRequest();

		searchModel.storeField( 'plain', [ 'some', 'value' ] );
		searchModel.storeField( 'not', 'some word' );
		trackingEvent.populateFromStoreOptions( searchModel.getFields() );

		assert.strictEqual( trackingEvent.getEventData().plain, true, 'option "plain" is being used' );
		assert.strictEqual( trackingEvent.getEventData().not, true, 'option "not" is being used' );
		assert.strictEqual( trackingEvent.getEventData().or, false, 'option "or" is not being used' );
	} );

}() );
