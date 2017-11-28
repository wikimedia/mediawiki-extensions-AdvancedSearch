( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	var getOptions = function ( optionProvider ) {
		return [ { data: '', label: '' } ]
			.concat( optionProvider.getFileGroupOptions() )
			.concat( optionProvider.getAllowedFileTypeOptions() );
	};

	/**
	 * @class
	 * @extends {OO.ui.DropdownInputWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {ext.advancedSearch.dm.FileTypeOptionProvider} optionProvider
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.FileTypeSelection = function ( store, optionProvider, config ) {
		config = $.extend( { options: getOptions( optionProvider ) }, config );
		this.store = store;
		this.optionId = config.optionId;

		// Parent constructor
		mw.libs.advancedSearch.ui.FileTypeSelection.parent.call( this, config );

		store.connect( this, { update: 'onStoreUpdate' } );

		this.setValueFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.FileTypeSelection, OO.ui.DropdownInputWidget );

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
	};

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.setValueFromStore = function () {
		var storeValue = this.store.getOption( this.optionId ),
			selectedItem = this.dropdownWidget.getMenu().getItemFromData( storeValue );
		// avoid setting invalid values and re-triggering
		if ( selectedItem === null || this.getValue() === storeValue ) {
			return;
		}
		this.setValue( storeValue );
	};

}( mediaWiki, jQuery ) );
