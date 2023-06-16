( function () {
	let LanguageOptionProvider,
		languages = {
			en: 'English',
			de: 'Deutsch',
			bg: 'Български'
		};

	QUnit.testStart( function () {
		LanguageOptionProvider = mw.libs.advancedSearch.dm.LanguageOptionProvider;
	} );

	QUnit.module( 'ext.advancedSearch.dm.LanguageOptionProvider' );

	QUnit.test( 'Languages are correctly formatted', function ( assert ) {
		const provider = new LanguageOptionProvider( languages );
		assert.deepEqual( provider.getLanguages(), [
			{ data: 'bg', label: 'bg - Български' },
			{ data: 'de', label: 'de - Deutsch' },
			{ data: 'en', label: 'en - English' }

		] );
	} );

	QUnit.test( 'Returns empty languages list when languages object is empty', function ( assert ) {
		languages = {};
		const provider = new LanguageOptionProvider( languages );
		assert.deepEqual( provider.getLanguages(), [] );
	} );

}() );
