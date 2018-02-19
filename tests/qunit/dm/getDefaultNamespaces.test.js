( function ( mw ) {
	var getDefaultNamespaces = mw.libs.advancedSearch.dm.getDefaultNamespaces,
		SearchModel = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.dm.getDefaultNamespaces' );

	QUnit.test( 'Empty user settings return article namespace', function ( assert ) {
		assert.deepEqual( getDefaultNamespaces( {} ), [ SearchModel.MAIN_NAMESPACE ] );
	} );

	QUnit.test( 'User settings without namespaces return article namespace', function ( assert ) {
		assert.deepEqual(
			getDefaultNamespaces( {
				foo: 1,
				bar: 2
			} ),
			[ SearchModel.MAIN_NAMESPACE ]
		);
	} );

	QUnit.test( 'User settings with all namespaces set to false return article namespace', function ( assert ) {
		assert.deepEqual(
			getDefaultNamespaces( {
				foo: 1,
				searchNs0: false,
				searchNs1: false,
				searchNs10: false,
				searchNs99: false
			} ),
			[ SearchModel.MAIN_NAMESPACE ]
		);
	} );

	QUnit.test( 'All selected namespaces are returned', function ( assert ) {
		var namespaces = getDefaultNamespaces( {
			foo: 1,
			searchNs0: true,
			searchNs1: false,
			searchNs10: true,
			searchNs11: false,
			searchNs12: true,
			searchNs99: false
		} );
		namespaces.sort();

		assert.deepEqual( namespaces, [ '0', '10', '12' ] );
	} );

}( mediaWiki ) );
