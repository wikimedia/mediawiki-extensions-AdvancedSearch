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

		SearchPage.toggleInputFields();

		assert( SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchExactText.getPlaceholderText() !== '' );
		assert( SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchOneWord.getPlaceholderText() === '' );

		// Test pill creation
		SearchPage.searchTheseWords.put( 'these1 these2, these3\n' );

		assert.deepStrictEqual(
			SearchPage.searchTheseWords.getTagLabels(),
			[ 'these1', 'these2', 'these3' ],
			'Pill field creates pills from spaces and line breaks'
		);

		// Add more content
		SearchPage.searchNotTheseWords.put( 'not1 not2,' );
		SearchPage.searchOneWord.put( 'one1 one2' );
		SearchPage.searchExactText.put( '"exact test"' );

		// Test autocompletion
		SearchPage.addCategory( 'Existing Category' );
		SearchPage.addTemplate( 'Existing Template' );

		SearchPage.searchCategory.put( 'Existing C' );
		SearchPage.categorySuggestionsBox.waitForDisplayed();
		assert(
			SearchPage.categorySuggestionsBox.isDisplayed(),
			'suggest exiting category when typing'
		);
		SearchPage.searchCategory.put( '\nCategory2\n' );

		SearchPage.searchTemplate.put( 'Existing T' );
		SearchPage.templateSuggestionsBox.waitForDisplayed();
		assert(
			SearchPage.templateSuggestionsBox.isDisplayed(),
			'suggest exiting template when typing'
		);
		SearchPage.searchTemplate.put( '\nTemplate2\n' );

		// Test red linking
		assert(
			SearchPage.getCategoryPillLink( 'Category2' ).getAttribute( 'class' ).includes( 'new' ),
			'Pill field marks non-existent categories in red'
		);
		assert(
			SearchPage.getTemplatePillLink( 'Template2' ).getAttribute( 'class' ).includes( 'new' ),
			'Pill field marks non-existent templates in red'
		);

		// Test submitting with double enter
		SearchPage.searchTheseWords.put( '\n\n' );

		assert( SearchPage.formWasSubmitted(), 'form was submitted on double enter in "These Words" field' );

		// Test query composition
		assert.strictEqual(
			SearchPage.getSearchQueryFromUrl(),
			'these1 these2 these3 "exact test" -not1 -not2 one1 OR one2 deepcat:"Existing Category" deepcat:Category2 hastemplate:"Existing Template" hastemplate:Template2'
		);
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( '\n' );

		assert( SearchPage.formWasSubmitted() );
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
} );
