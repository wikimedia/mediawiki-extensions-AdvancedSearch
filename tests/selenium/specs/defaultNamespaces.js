'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	UserLoginPage = require( 'wdio-mediawiki/LoginPage' );

describe( 'Advanced Search', () => {

	before( async () => {
		await UserLoginPage.loginAdmin();
	} );

	it( 'allows logged-in users to remember the selection of namespaces for future searches', async () => {
		await SearchPage.open();

		await SearchPage.expandNamespacesPreview();
		await SearchPage.generalHelpPreset.click();
		await SearchPage.rememberSelection.click();

		const cache = await SearchPage.getSelectedNamespaceIDs();

		await SearchPage.submitForm();

		await SearchPage.expandNamespacesPreview();
		assert.deepStrictEqual( cache, await SearchPage.getSelectedNamespaceIDs() );
	} );

	it( 'selects the users default namespaces when logged in', async () => {
		const namespaceOptions = [ '0', '1', '2', '10' ];
		await SearchPage.setSearchNamespaceOptions( namespaceOptions );
		await SearchPage.open();

		await SearchPage.expandNamespacesPreview();

		const selectedNamespaceIDs = await SearchPage.getSelectedNamespaceIDs();
		selectedNamespaceIDs.sort();
		namespaceOptions.sort();

		assert( await SearchPage.default.isSelected(), 'The default checkbox is selected' );
		assert.deepStrictEqual( selectedNamespaceIDs, namespaceOptions );
	} );

	it( 'selects the namespaces from the URL', async () => {
		await SearchPage.open( { ns0: 1, ns1: 1, ns2: 1, ns10: 1 } );

		await SearchPage.expandNamespacesPreview();

		const selectedNamespaceIDs = await SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();

		assert.deepStrictEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

	after( async () => {
		await browser.deleteCookies();
	} );
} );
