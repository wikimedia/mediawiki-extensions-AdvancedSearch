( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.DropdownInputWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */

	mw.libs.advancedSearch.ui.StoreListener = function ( store, config ) {
		this.store = store;
		this.optionId = config.optionId;

		mw.libs.advancedSearch.ui.StoreListener.parent.call( this, config );
		store.connect( this, { update: 'onStoreUpdate' } );
		this.setValueFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.StoreListener, OO.ui.DropdownInputWidget );

	mw.libs.advancedSearch.ui.StoreListener.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
	};

	mw.libs.advancedSearch.ui.StoreListener.prototype.setValueFromStore = function () {
		if ( this.store.hasOptionChanged( this.optionId, this.getValue() ) ) {
			this.setValue( this.store.getOption( this.optionId ) );
		}
	};

}() );
