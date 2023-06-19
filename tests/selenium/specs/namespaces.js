'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	UserLoginPage = require( 'wdio-mediawiki/LoginPage' );

describe( 'AdvancedSearch', function () {
	beforeEach( function () {
		browser.deleteCookies();
		SearchPage.open();
	} );

	it( 'namespace selection', function () {
		SearchPage.expandNamespacesPreview();

		// do not allow remembering the selection for anon users
		assert( !SearchPage.rememberSelection.isExisting() );

		// select all namespaces
		SearchPage.allNamespacesPreset.click();
		SearchPage.expandNamespacesMenu();

		assert.deepStrictEqual(
			SearchPage.namespaces.getAllTagLabels(),
			SearchPage.namespaces.getAllLabelsFromMenu()
		);

		// deselect all namespaces
		SearchPage.allNamespacesPreset.click();

		assert.deepStrictEqual(
			SearchPage.namespaces.getAllTagLabels(),
			[]
		);

		// select all namespaces manually
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.selectAll();
		assert( SearchPage.allNamespacesPreset.isSelected() );

		SearchPage.namespaces.clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( !SearchPage.allNamespacesPreset.isSelected(), 'preset is not checked if a namespace is missing' );
		assert( SearchPage.generalHelpPreset.isSelected() );

		SearchPage.submitForm();

		assert( SearchPage.generalHelpPreset.isSelected(), 'marks a namespace preset checkbox after submit' );
	} );

	it( 'allows logged-in users to remember the selection of namespaces for future searches', function () {
		UserLoginPage.loginAdmin();
		SearchPage.open();

		SearchPage.expandNamespacesPreview();
		SearchPage.generalHelpPreset.click();
		SearchPage.rememberSelection.click();
		const cache = SearchPage.getSelectedNamespaceIDs();

		SearchPage.submitForm();

		assert.deepStrictEqual( cache, SearchPage.getSelectedNamespaceIDs() );
	} );

	it( 're-adds filetype namespace after search when file type option has been selected but namespace has been removed', function () {
		SearchPage.toggleInputFields();

		SearchPage.searchTheseWords.put( 'dog' );
		SearchPage.searchFileType.selectImageType();
		SearchPage.expandNamespacesPreview();
		// clears the namespace bar
		SearchPage.allNamespacesPreset.click();
		SearchPage.allNamespacesPreset.click();

		SearchPage.submitForm();

		assert( SearchPage.getSelectedNamespaceIDs().includes( SearchPage.FILE_NAMESPACE ) );
	} );

	it( 'adds/removes the namespace tag when the namespace option is clicked', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( SearchPage.getSelectedNamespaceIDs().includes( SearchPage.FILE_NAMESPACE ) );

		SearchPage.namespaces.clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( !SearchPage.getSelectedNamespaceIDs().includes( SearchPage.FILE_NAMESPACE ) );
	} );
} );
