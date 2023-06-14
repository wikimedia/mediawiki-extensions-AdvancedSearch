'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	SpecialPage = require( '../pageobjects/special.page' );

describe( 'Advanced Search submit', function () {

	beforeEach( function () {
		SearchPage.open();
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
