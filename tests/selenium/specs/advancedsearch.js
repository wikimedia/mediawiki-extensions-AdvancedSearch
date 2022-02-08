'use strict';

const assert = require( 'assert' ),
	SpecialPage = require( '../pageobjects/special.page' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	beforeEach( function () {
		SearchPage.open();
	} );

	it( 'inserts advanced search elements on search page', function () {
		assert( SearchPage.searchContainer.isDisplayed() );
	} );

	it( 'finds no placeholders for "These words" "None of these words" and "One of these words"', function () {
		SearchPage.toggleInputFields();

		assert( SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchOneWord.getPlaceholderText() === '' );
	} );

	it( 'finds placeholder for "Exactly this text".', function () {
		SearchPage.toggleInputFields();

		assert( SearchPage.searchExactText.getPlaceholderText() !== '' );
	} );

	it( 'displays "These words" as a pill field ', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test test2,' );

		assert.deepStrictEqual( SearchPage.searchTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'displays "One of these words" as a pill field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchOneWord.put( 'testäöü test2äß, testme3\n' );

		assert.deepStrictEqual( SearchPage.searchOneWord.getTagLabels(), [ 'testäöü', 'test2äß', 'testme3' ] );
	} );

	it( 'displays "None of these words" as a pill field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchNotTheseWords.put( 'test test2,' );

		assert.deepStrictEqual( SearchPage.searchNotTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( '\n' );

		assert( SearchPage.formWasSubmitted() );
	} );

	it( 'does not submit the search on enter when there is text in "These Words" field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\uE007' );

		assert( !SearchPage.formWasSubmitted() );
	} );

	it( 'submits the search on double enter when there is text in "These Words" field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\n\n' );

		assert( SearchPage.formWasSubmitted() );
	} );

	it( 'submits the search with the correct search terms from all the pill fields', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );
		SearchPage.searchCategory.put( 'Help\nMe\n' );
		SearchPage.searchTemplate.put( 'Main Page\n' );
		SearchPage.submitForm();

		assert.strictEqual( SearchPage.getSearchQueryFromUrl(), 'test "test1 test2" -test3 test4 OR test5 deepcat:Help deepcat:Me hastemplate:"Main Page"' );
	} );

	it( 'marks non-existent categories in red', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchCategory.put( 'I do not exist\n' );
		SearchPage.getCategoryPillLink( 'I do not exist' ).waitForDisplayed();

		assert( SearchPage.getCategoryPillLink( 'I do not exist' ).getAttribute( 'class' ).includes( 'new' ) );
	} );

	it( 'suggests existing categories when typing', function () {
		SearchPage.addCategory( 'Test' );

		SearchPage.toggleInputFields();

		SearchPage.searchCategory.put( 'Tes' );
		const suggestionBox = SearchPage.categorySuggestionsBox;
		suggestionBox.waitForDisplayed();

		assert( suggestionBox.isDisplayed() );
	} );

	it( 'inserts inlanguage field only when the translate extension is installed', function () {
		if ( SpecialPage.translateExtensionLink.isDisplayed() ) {
			assert( SearchPage.searchInLanguage.isDisplayed() );
		} else {
			assert( !SearchPage.searchInLanguage.isDisplayed() );
		}
	} );

	it( 'submits the search with the specific chosen language', function () {
		if ( !SpecialPage.translateExtensionLink.isDisplayed() ) {
			this.skip();
		}

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'en' );
		SearchPage.submitForm();

		assert.strictEqual( SearchPage.getSearchQueryFromUrl(), 'goat inlanguage:en' );
	} );

	it( 'submits the search without taking into consideration inlanguage if the default option is selected', function () {
		if ( !SpecialPage.translateExtensionLink.isDisplayed() ) {
			this.skip();
		}

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'de' );
		SearchPage.searchInLanguage.choose( '' );
		SearchPage.submitForm();

		assert.strictEqual( SearchPage.getSearchQueryFromUrl(), 'goat' );
	} );

	it( 'marks non-existent templates in red', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTemplate.put( 'Void\n' );
		SearchPage.getTemplatePillLink( 'Void' ).waitForDisplayed();

		assert( SearchPage.getTemplatePillLink( 'Void' ).getAttribute( 'class' ).includes( 'new' ) );
	} );

	it( 'suggests existing templates when typing', function () {
		SearchPage.addTemplate( 'What is love?' );

		SearchPage.toggleInputFields();

		SearchPage.searchTemplate.put( 'What is lo' );
		SearchPage.templateSuggestionsBox.waitForDisplayed();

		assert( SearchPage.templateSuggestionsBox.isDisplayed() );
	} );

} );
