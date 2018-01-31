'use strict';
const Page = require( '../../../../../tests/selenium/pageobjects/page' );

class SpecialPage extends Page {

	get cirrusSearchExtensionLink() { return browser.element( '#mw-version-ext-other-CirrusSearch' ); }
	get advancedSearchExtensionLink() { return browser.element( '#mw-version-ext-other-AdvancedSearch' ); }

	open() {
		super.open( 'Special:Version' );
	}

}
module.exports = new SpecialPage();