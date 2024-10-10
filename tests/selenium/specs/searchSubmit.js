'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	SpecialPage = require( '../pageobjects/special.page' );

describe( 'Advanced Search', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', async () => {
		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( '\n' );

		assert( await SearchPage.formWasSubmitted() );
	} );

	it( 'submits the search with the specific chosen language', async function () {
		if ( !await SpecialPage.translateExtensionLink.isDisplayed() ) {
			this.skip();
		}

		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( 'goat,' );
		await SearchPage.searchInLanguage.choose( 'en' );
		await SearchPage.submitForm();

		assert.strictEqual( await SearchPage.getSearchQueryFromUrl(), 'goat inlanguage:en' );
	} );
} );
