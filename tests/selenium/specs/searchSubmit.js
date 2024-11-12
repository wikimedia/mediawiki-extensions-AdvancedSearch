'use strict';

const SearchPage = require( '../pageobjects/search.page' );
const SpecialPage = require( '../pageobjects/special.page' );

describe( 'Advanced Search', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', async () => {
		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( '\n' );

		await expect( await SearchPage.formWasSubmitted() ).toBeTruthy();
	} );

	it( 'submits the search with the specific chosen language', async function () {
		if ( !await SpecialPage.translateExtensionLink.isDisplayed() ) {
			this.skip();
		}

		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( 'goat,' );
		await SearchPage.searchInLanguage.choose( 'en' );
		await SearchPage.submitForm();

		await expect( await SearchPage.getSearchQueryFromUrl() ).toStrictEqual( 'goat inlanguage:en' );
	} );
} );
