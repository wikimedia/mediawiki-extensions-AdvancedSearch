( function ( mw ) {

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};

	var FileTypeSelection = mw.libs.advancedSearch.ui.FileTypeSelection,
		Model = mw.libs.advancedSearch.dm.SearchModel,
		store = new Model(),
		optionProvider = {
			getFileGroupOptions: function () {
				return [
					{ optgroup: 'section' },
					{ data: 'bitmap', label: 'bitmapLabel' },
					{ data: 'vector', label: 'vector' }
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
			optionId: 'filetype',
			id: 'advancedSearchOption-filetype',
			name: 'advancedSearchOption-filetype',
			dropdown: { $overlay: true }
		},
		sandbox;

	QUnit.testStart( function () {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.FileTypeSelection' );

	QUnit.test( 'Dropdown menu options are set from store', function ( assert ) {
		var dropdown = new FileTypeSelection( store, optionProvider, config );
		var optionGroups = dropdown.$element[ 0 ].childNodes[ 0 ].childNodes;

		assert.equal( optionGroups[ 0 ].value, '', 'First option which is the default one from the dropdown is empty' );
		assert.equal( optionGroups[ 1 ].children[ 0 ].value, 'bitmap' );
		assert.equal( optionGroups[ 1 ].children[ 0 ].innerText, 'bitmapLabel', 'The label is different than the value' );
		assert.equal( optionGroups[ 1 ].children[ 1 ].value, 'vector' );
		assert.equal( optionGroups[ 2 ].children[ 0 ].value, 'image/png' );

	} );

	QUnit.test( 'Selected option is displayed', function ( assert ) {
		var dropdown = new FileTypeSelection( store, optionProvider, config );
		dropdown.setValue( 'bitmap' );

		assert.equal( dropdown.getValue(), 'bitmap' );

	} );

}( mediaWiki ) );
