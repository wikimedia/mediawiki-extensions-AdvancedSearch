( function () {
	const { getDefaultNamespaces } = require( 'ext.advancedSearch.elements' );

	QUnit.module( 'ext.advancedSearch.dm.getDefaultNamespaces' );

	QUnit.test( 'Empty user settings return no other default', ( assert ) => {
		assert.deepEqual( getDefaultNamespaces( {} ), [] );
	} );

	QUnit.test( 'User settings without namespaces return no other default', ( assert ) => {
		assert.deepEqual(
			getDefaultNamespaces( {
				foo: 1,
				bar: 2
			} ),
			[]
		);
	} );

	QUnit.test( 'User settings with all namespaces set to false return no other default', ( assert ) => {
		assert.deepEqual(
			getDefaultNamespaces( {
				foo: 1,
				searchNs0: false,
				searchNs1: false,
				searchNs10: false,
				searchNs99: false
			} ),
			[]
		);
	} );

	QUnit.test( 'All selected namespaces are returned', ( assert ) => {
		const namespaces = getDefaultNamespaces( {
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
}() );
