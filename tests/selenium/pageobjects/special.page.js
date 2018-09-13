'use strict';

const Page = require( 'wdio-mediawiki/Page' );

class SpecialPage extends Page {

	get cirrusSearchExtensionLink() { return browser.element( '#mw-version-ext-other-CirrusSearch' ); }
	get advancedSearchExtensionLink() { return browser.element( '#mw-version-ext-other-AdvancedSearch' ); }
	get translateExtensionLink() { return browser.element( '#mw-version-ext-other-Translate' ); }

	open() {
		super.openTitle( 'Special:Version' );
	}

}
module.exports = new SpecialPage();
