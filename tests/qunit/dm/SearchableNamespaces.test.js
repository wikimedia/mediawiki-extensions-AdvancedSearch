( function ( mw ) {
	'use strict';

	var Namespaces = mw.libs.advancedSearch.dm.SearchableNamespaces;

	QUnit.module( 'ext.advancedSearch.dm.SearchableNamespaces' );

	QUnit.test( 'Numeric IDs are converted to strings', function ( assert ) {
		var namespaces = new Namespaces( { 0: 'Article', 1: 'Talk' } );
		assert.deepEqual( namespaces.getNamespaceIds(), [ '0', '1' ] );
	} );

	QUnit.test( 'Only positive namespaces IDs are considered', function ( assert ) {
		var namespaces = new Namespaces( { '-2': 'Media', '-1': 'Special', 0: 'Article', 1: 'Talk' } );
		assert.deepEqual( namespaces.getNamespaceIds(), [ '0', '1' ] );
	} );

	QUnit.test( 'Article namespace label is set', function ( assert ) {
		var namespaces = new Namespaces( { 0: '', 1: 'Talk' } );
		assert.notEqual( namespaces.getNamespaceIds()[ '0' ], '' );
	} );

	QUnit.test( 'Other namespace labels are unchanged', function ( assert ) {
		var namespaces = new Namespaces( { 0: '', 1: 'Talk', 2: 'User', 3: 'User Talk' } );
		assert.notEqual( namespaces.getNamespaceIds()[ '1' ], 'Talk' );
		assert.notEqual( namespaces.getNamespaceIds()[ '2' ], 'User' );
		assert.notEqual( namespaces.getNamespaceIds()[ '3' ], 'User Talk' );
	} );

}( mediaWiki ) );
