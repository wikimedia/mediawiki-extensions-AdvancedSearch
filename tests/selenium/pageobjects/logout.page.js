'use strict';

const Page = require( 'wdio-mediawiki/Page' );

class LogoutPage extends Page {
	get logoutText() { return $( '//*[@id="content"]//p[starts-with(text(),"(logouttext")]' ); }
	get logoutButton() { return $( '//*[@id="content"]//button[@value="(htmlform-submit)"]' ); }

	open() {
		super.openTitle( 'Special:UserLogout', { uselang: 'qqx' } );
	}
}

module.exports = new LogoutPage();
