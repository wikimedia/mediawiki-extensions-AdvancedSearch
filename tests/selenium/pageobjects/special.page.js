import Page from 'wdio-mediawiki/Page';

class SpecialPage extends Page {

	get translateExtensionLink() {
		return $( '#mw-version-ext-other-Translate' );
	}

	async open() {
		await super.openTitle( 'Special:Version' );
	}

}
export default new SpecialPage();
