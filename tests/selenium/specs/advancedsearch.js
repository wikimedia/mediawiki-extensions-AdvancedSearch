'use strict';

const assert = require( 'assert' );
const SpecialPage = require( '../pageobjects/special.page' );
const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

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

		assert( SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchOneWord.getPlaceholderText() === '' );

	} );

	it( 'finds placeholder for "Exactly this text".', function () {

		SearchPage.open();

		assert( SearchPage.searchExactText.getPlaceholderText() !== '' );

	} );

	it( 'displays "These words" as a pill field ', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test test2,' );

		assert.deepEqual( SearchPage.searchTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'displays "One of these words" as a pill field', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchOneWord.put( 'testäöü test2äß, testme3\uE007' );

		assert.deepEqual( SearchPage.searchOneWord.getTagLabels(), [ 'testäöü', 'test2äß', 'testme3' ] );
	} );

	it( 'displays "None of these words" as a pill field', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchNotTheseWords.put( 'test test2,' );

		assert.deepEqual( SearchPage.searchNotTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( '\uE007' );

		assert( SearchPage.formWasSubmitted() );

	} );

	it( 'does not submit the search on enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\uE007' );

		assert( !SearchPage.formWasSubmitted() );

	} );

	it( 'submits the search on double enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\uE007\uE007' );

		assert( SearchPage.formWasSubmitted() );

	} );

	it( 'submits the search with the correct search terms from all the pill fields', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'test "test1 test2" -test3 test4 OR test5' );

	} );

	it( 'inserts inlanguage field only when the translate extension is installed', function () {
		SearchPage.open();

		if ( SpecialPage.translateExtensionLink.isVisible() ) {
			assert( SearchPage.searchInLanguage.isVisible() );
		} else {
			assert( !SearchPage.searchInLanguage.isVisible() );
		}

	} );

	it( 'submits the search with the specific chosen language', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'en' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'goat inlanguage:en' );

	} );

	it( 'submits the search without taking into consideration inlanguage if the default option is selected', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'de' );
		SearchPage.searchInLanguage.choose( '' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'goat' );

	} );

} );
