'use strict';

var assert = require( 'assert' );
var SpecialPage = require( '../pageobjects/special.page' );
var SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	function testPillCreation( pillField, pillFieldLabels, input, expectedLabels ) {
		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		pillField.click();
		browser.keys( input );
		pillFieldLabels.getText().map( function ( text, idx ) {
			assert( text === expectedLabels[ idx ] );
		} );

	}

	it( 'has the advanced search extension installed', function () {

		SpecialPage.open();

		assert( SpecialPage.advancedSearchExtensionLink.isVisible() );

	} );

	it( 'inserts advanced search elements on search page', function () {

		SearchPage.open();
		assert( SearchPage.searchContainer.isVisible() );
	} );

	it( 'finds no placeholders for "These words" "None of these words" and "One of these words"', function () {

		SearchPage.open();

		assert( SearchPage.searchTheseWords.element( 'input' ).getAttribute( 'placeholder' ) === '' );
		assert( SearchPage.searchNotTheseWords.element( 'input' ).getAttribute( 'placeholder' ) === '' );
		assert( SearchPage.searchOneWord.element( 'input' ).getAttribute( 'placeholder' ) === '' );

	} );

	it( 'finds placeholder for "Exactly this text".', function () {

		SearchPage.open();
		assert( SearchPage.searchExactText.getAttribute( 'placeholder' ) !== '' );

	} );

	it( 'displays "These words" as a pill field ', function () {

		testPillCreation( SearchPage.searchTheseWords, SearchPage.searchTheseWordsTagLabel, 'test test2,', [ 'test', 'test2' ] );

	} );

	it( 'displays "One of these words" as a pill field', function () {

		testPillCreation( SearchPage.searchOneWord, SearchPage.searchOneWordTagLabel, 'testäöü test2äß, testme3\uE007', [ 'testäöü', 'test2äß', 'testme3' ] );

	} );

	it( 'displays "None of these words" as a pill field', function () {

		testPillCreation( SearchPage.searchNotTheseWords, SearchPage.searchNotTheseWordsTagLabel, 'test, test2,', [ 'test', 'test2' ] );

	} );

	it( 'submits the search on enter when there is no text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( '\uE007' );
		assert( SearchPage.formWasSubmitted() );

	} );

	it( 'does not submit the search on enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( 'test\uE007' );
		assert( !SearchPage.formWasSubmitted() );

	} );

	it( 'submits the search on double enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( 'test\uE007\uE007' );
		assert( SearchPage.formWasSubmitted() );

	} );

	it( 'submits the search with the correct search terms from all the pill fields', function () {
		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( 'test,' );
		SearchPage.searchNotTheseWords.click();
		browser.keys( 'test3 ' );
		SearchPage.searchOneWord.click();
		browser.keys( 'test4 test5' );
		SearchPage.searchExactText.setValue( '"test1 test2"\uE007' );

		assert( SearchPage.getSearchURL() === 'search=test+"test1+test2"+-test3+test4+OR+test5' );

	} );

} );
