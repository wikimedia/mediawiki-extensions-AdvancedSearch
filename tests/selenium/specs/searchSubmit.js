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
		assert.strictEqual( SearchPage.searchPreviewItems.value.length, 4, 'Number of preview pills must match number of filled fields' );
	} );

	it( 'collapses search preview after submission', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.submitForm();

		assert( SearchPage.advancedSearchIsCollapsed() );
	} );

} );
