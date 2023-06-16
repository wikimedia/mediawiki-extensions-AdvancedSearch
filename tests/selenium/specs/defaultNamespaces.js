'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	UserLoginPage = require( 'wdio-mediawiki/LoginPage' );

describe( 'Advanced Search', function () {
	beforeEach( function () {
		browser.deleteCookies();
	} );

	it( 'selects the users default namespaces when logged in', function () {
		UserLoginPage.loginAdmin();

		const namespaceOptions = [ '0', '1', '2', '10' ];
		SearchPage.setSearchNamespaceOptions( namespaceOptions );
		SearchPage.open();

		SearchPage.expandNamespacesPreview();

		const selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs();
		selectedNamespaceIDs.sort();
		namespaceOptions.sort();

		assert( SearchPage.default.isSelected(), 'The default checkbox is selected' );
		assert.deepStrictEqual( selectedNamespaceIDs, namespaceOptions );
	} );

	it( 'selects the namespaces from the URL', function () {
		SearchPage.open( { ns0: 1, ns1: 1, ns2: 1, ns10: 1 } );

		SearchPage.expandNamespacesPreview();

		const selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();

		assert.deepStrictEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );
} );
