( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.TextInputWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.TextInput = function ( store, config ) {
		var myConfig = $.extend( {}, config || {} );
		this.store = store;
		this.optionId = config.optionId;

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.TextInput.parent.call( this, myConfig );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.TextInput, OO.ui.TextInputWidget );

	mw.libs.advancedSearch.ui.TextInput.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.TextInput.prototype.populateFromStore = function () {
		var val = this.store.getOption( this.optionId );
		if ( this.getValue() === val ) {
			return;
		}
		this.setValue( val );
	};

} )( mediaWiki, jQuery );
