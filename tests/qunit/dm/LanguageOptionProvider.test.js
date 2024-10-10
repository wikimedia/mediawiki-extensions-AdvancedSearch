( function () {
	const { LanguageOptionProvider } = require( 'ext.advancedSearch.SearchFieldUI' );

	let languages = {
		en: 'English',
		de: 'Deutsch',
		bg: 'Български'
	};

	QUnit.module( 'ext.advancedSearch.dm.LanguageOptionProvider' );

	QUnit.test( 'Languages are correctly formatted', ( assert ) => {
		const provider = new LanguageOptionProvider( languages );
		assert.deepEqual( provider.getLanguages(), [
			{ data: 'bg', label: 'bg - Български' },
			{ data: 'de', label: 'de - Deutsch' },
			{ data: 'en', label: 'en - English' }

		] );
	} );

	QUnit.test( 'Returns empty languages list when languages object is empty', ( assert ) => {
		languages = {};
		const provider = new LanguageOptionProvider( languages );
		assert.deepEqual( provider.getLanguages(), [] );
	} );
}() );
