( function ( mw ) {

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};

	var LanguageSelection = mw.libs.advancedSearch.ui.LanguageSelection,
		Model = mw.libs.advancedSearch.dm.SearchModel,
		store = new Model(),
		optionProvider = {
			getLanguages: function () {
				return [
					{ data: 'de', label: 'de - Deutsch' },
					{ data: 'en', label: 'en - English' },
					{ data: 'bg', label: 'bg - Български' }
				];
			}
		},
		config = {
			optionId: 'inlanguage',
			id: 'advancedSearchOption-inlanguage',
			dropdown: { $overlay: true }
		};

	QUnit.module( 'ext.advancedSearch.ui.LanguageSelection' );

	QUnit.test( 'Dropdown menu options are set from provider', function ( assert ) {
		var dropdown = new LanguageSelection( store, optionProvider, config );
		var optionGroups = dropdown.$element[ 0 ].childNodes[ 0 ];

		assert.equal( optionGroups[ 0 ].value, '', 'First option (default one)' );
		assert.equal( optionGroups[ 1 ].value, 'de' );
		assert.equal( optionGroups[ 1 ].innerHTML, 'de - Deutsch' );
		assert.equal( optionGroups[ 2 ].value, 'en' );
		assert.equal( optionGroups[ 3 ].value, 'bg' );
	} );

	QUnit.test( 'Dropdown menu updates when store changes', function ( assert ) {
		var dropdown = new LanguageSelection( store, optionProvider, config );

		store.storeOption( 'inlanguage', 'bg' );
		assert.equal( dropdown.getValue(), 'bg' );

		store.storeOption( 'inlanguage', '' );
		assert.equal( dropdown.getValue(), '' );
	} );

	QUnit.test( 'Selected option is displayed', function ( assert ) {
		var dropdown = new LanguageSelection( store, optionProvider, config );
		dropdown.setValue( 'en' );

		assert.equal( dropdown.getValue(), 'en' );
	} );

}( mediaWiki ) );
