( function () {
	const { LanguageSelection } = require( 'ext.advancedSearch.SearchFieldUI' );
	const { SearchModel } = require( 'ext.advancedSearch.elements' );
	const store = new SearchModel(),
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
			fieldId: 'inlanguage',
			id: 'advancedSearchOption-inlanguage',
			dropdown: { $overlay: true }
		};

	QUnit.module( 'ext.advancedSearch.ui.LanguageSelection' );

	QUnit.test( 'Dropdown menu fields are set from provider', ( assert ) => {
		const dropdown = new LanguageSelection( store, optionProvider, config );
		const optionGroups = dropdown.$element[ 0 ].childNodes[ 0 ];

		assert.strictEqual( optionGroups[ 0 ].value, '', 'First option (default one)' );
		assert.strictEqual( optionGroups[ 1 ].value, 'de' );
		assert.strictEqual( optionGroups[ 1 ].innerHTML, 'de - Deutsch' );
		assert.strictEqual( optionGroups[ 2 ].value, 'en' );
		assert.strictEqual( optionGroups[ 3 ].value, 'bg' );
	} );

	QUnit.test( 'Dropdown menu updates when store changes', ( assert ) => {
		const dropdown = new LanguageSelection( store, optionProvider, config );

		store.storeField( 'inlanguage', 'bg' );
		assert.strictEqual( dropdown.getValue(), 'bg' );

		store.storeField( 'inlanguage', '' );
		assert.strictEqual( dropdown.getValue(), '' );
	} );

	QUnit.test( 'Selected option is displayed', ( assert ) => {
		const dropdown = new LanguageSelection( store, optionProvider, config );
		dropdown.setValue( 'en' );

		assert.strictEqual( dropdown.getValue(), 'en' );
	} );
}() );
