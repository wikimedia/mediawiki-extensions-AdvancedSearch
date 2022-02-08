'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search submit', function () {

	beforeEach( function () {
		SearchPage.open();
	} );

	it( 'no search preview is shown in expanded state', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );

		assert( !SearchPage.searchPreviewItem.isExisting(), 'No preview pill elements should exist' );
	} );

	it( 'shows search preview in collapsed state', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );
		SearchPage.toggleInputFields();
		browser.waitUntil( SearchPage.advancedSearchIsCollapsed );

		assert( SearchPage.searchPreviewItem.isExisting(), 'Preview pills should be shown' );
		assert.strictEqual( SearchPage.searchPreviewItems.length, 5, 'Number of preview pills must match number of filled fields + 1 (default sorting)' );
	} );

	it( 'collapses search preview after submission', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.submitForm();

		assert( SearchPage.advancedSearchIsCollapsed() );
	} );

	it( 'no namespaces preview is shown in expanded state', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );

		assert( !SearchPage.namespacePreviewItems.isExisting(), 'No preview pill elements should exist' );
	} );

	it( 'shows namespaces preview in collapsed state', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );
		SearchPage.namespacesPreview.click();
		SearchPage.namespacesMenu.waitForDisplayed( { reverse: true } );

		assert( SearchPage.namespacePreviewItems.isExisting(), 'Preview pills should be shown' );
	} );

	it( 'collapses namespaces preview after submission', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );
		SearchPage.submitForm();

		assert( !SearchPage.namespacesMenu.isDisplayed() );
	} );

} );
