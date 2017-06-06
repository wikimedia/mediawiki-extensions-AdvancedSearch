( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * FieldLayout that can show and hide itself when the store changes, based on visibility function
	 *
	 * @class
	 * @extends {OO.ui.FieldLayout}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {OO.ui.Widget} widget
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.OptionalElementLayout = function ( store, widget, config ) {
		this.store = store;
		this.checkVisibility = config.checkVisibility;

		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.OptionalElementLayout.parent.call( this, widget, config );

		this.toggle( this.checkVisibility() );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.OptionalElementLayout, OO.ui.FieldLayout );

	mw.libs.advancedSearch.ui.OptionalElementLayout.prototype.onStoreUpdate = function () {
		this.toggle( this.checkVisibility() );
	};

} )( mediaWiki );
