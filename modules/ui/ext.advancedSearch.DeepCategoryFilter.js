( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.MultiselectLookup}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.DeepCategoryFilter = function ( store, config ) {
		this.store = store;

		mw.libs.advancedSearch.ui.DeepCategoryFilter.parent.call( this, store, config );

		this.$element.addClass( 'mw-advancedSearch-deepCategory' );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.DeepCategoryFilter, mw.libs.advancedSearch.dm.MultiselectLookup );

	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.populateFromStore = function () {
		if ( this.store.hasOptionChanged( this.optionId, this.getValue() ) ) {
			this.setValue( this.store.getOption( this.optionId ) );
		}
	};

}( mediaWiki ) );
