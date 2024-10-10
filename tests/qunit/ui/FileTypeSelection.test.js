( function () {
	const { FileTypeSelection } = require( 'ext.advancedSearch.SearchFieldUI' );
	const { SearchModel } = require( 'ext.advancedSearch.elements' );

	const store = new SearchModel(),
		optionProvider = {
			getFileGroupOptions: function () {
				return [
					{ optgroup: 'section' },
					{ data: 'bitmap', label: 'bitmapLabel' },
					{ data: 'drawing', label: 'drawing' }
				];
			},
			getAllowedFileTypeOptions: function () {
				return [
					{ optgroup: 'Image formats' },
					{ data: 'image/png', label: 'png' }
				];
			}
		},
		config = {
			fieldId: 'filetype',
			id: 'advancedSearchOption-filetype',
			dropdown: { $overlay: true }
		};

	QUnit.module( 'ext.advancedSearch.ui.FileTypeSelection' );

	QUnit.test( 'Dropdown menu fields are set from the provider', ( assert ) => {
		const dropdown = new FileTypeSelection( store, optionProvider, config );
		const optionGroups = dropdown.$element[ 0 ].childNodes[ 0 ].childNodes;

		assert.strictEqual( optionGroups[ 0 ].value, '', 'First option which is the default one from the dropdown is empty' );
		assert.strictEqual( optionGroups[ 1 ].children[ 0 ].value, 'bitmap' );
		assert.strictEqual( optionGroups[ 1 ].children[ 0 ].innerText, 'bitmapLabel', 'The label is different than the value' );
		assert.strictEqual( optionGroups[ 1 ].children[ 1 ].value, 'drawing' );
		assert.strictEqual( optionGroups[ 2 ].children[ 0 ].value, 'image/png' );
	} );

	QUnit.test( 'Dropdown menu updates when store changes', ( assert ) => {
		const dropdown = new FileTypeSelection( store, optionProvider, config );

		store.storeField( 'filetype', 'drawing' );
		assert.strictEqual( dropdown.getValue(), 'drawing' );

		store.storeField( 'filetype', '' );
		assert.strictEqual( dropdown.getValue(), '' );
	} );

	QUnit.test( 'Selected option is displayed', ( assert ) => {
		const dropdown = new FileTypeSelection( store, optionProvider, config );
		dropdown.setValue( 'bitmap' );

		assert.strictEqual( dropdown.getValue(), 'bitmap' );
	} );
}() );
