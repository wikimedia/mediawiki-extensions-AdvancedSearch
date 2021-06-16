'use strict';

const Page = require( 'wdio-mediawiki/Page' );

class SpecialPage extends Page {

	get translateExtensionLink() { return $( '#mw-version-ext-other-Translate' ); }

	open() {
		super.openTitle( 'Special:Version' );
	}

}
module.exports = new SpecialPage();
