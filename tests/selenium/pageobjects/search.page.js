'use strict';
const Page = require( '../../../../../tests/selenium/pageobjects/page' );

class SearchPage extends Page {

	get searchContainer() { return browser.element( '.mw-advancedSearch-container' ); }

	open() {
		super.open( 'Special:Search' );
	}

}
module.exports = new SearchPage();
