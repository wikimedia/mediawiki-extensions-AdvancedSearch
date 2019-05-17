'use strict';

const assert = require( 'assert' );
const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search submit', function () {

	it( 'no search preview is shown in expanded state', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );

		assert( !SearchPage.searchPreviewItems.isExisting(), 'No preview pill elements should exist' );
	} );

	it( 'shows search preview in collapsed state', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );
		SearchPage.toggleInputFields();
		browser.waitUntil( SearchPage.advancedSearchIsCollapsed, 5000 );

		assert( SearchPage.searchPreviewItems.isExisting(), 'Preview pills should be shown' );
		assert.strictEqual( SearchPage.searchPreviewItems.value.length, 5, 'Number of preview pills must match number of filled fields + 1 (default sorting)' );
	} );

	it( 'collapses search preview after submission', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.submitForm();

		assert( SearchPage.advancedSearchIsCollapsed() );
	} );

	it( 'no namespaces preview is shown in expanded state', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.namespaces.toggleNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );
		assert( !SearchPage.namespacePreviewItems.isExisting(), 'No preview pill elements should exist' );
	} );

	it( 'shows namespaces preview in collapsed state', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.namespaces.toggleNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );
		SearchPage.namespaces.toggleNamespacesPreview();
		browser.waitUntil( SearchPage.namespacePreviewIsCollapsed, 5000 );
		assert( SearchPage.namespacePreviewItems.isExisting(), 'Preview pills should be shown' );
	} );

	it( 'collapses namespaces preview after submission', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.namespaces.toggleNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );
		SearchPage.submitForm();
		assert( SearchPage.namespacePreviewIsCollapsed() );
	} );

} );
