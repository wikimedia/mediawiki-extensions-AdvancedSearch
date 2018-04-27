( function ( mw, $ ) {

	/**
	 * @class
	 * @extends {mw.widgets.CategoryMultiselectWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.DeepCategoryFilter = function ( store, config ) {
		config = $.extend( {}, config );
		this.store = store;
		this.optionId = config.optionId;

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.DeepCategoryFilter.parent.call( this, config );

		// Removes the default placeholder
		this.$input.attr( 'placeholder', '' );

		this.$element.addClass( 'mw-advancedSearch-deepCategory' );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.DeepCategoryFilter, mw.widgets.CategoryMultiselectWidget );

	/**
	 * @return {String[]}
	 */
	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.getValue = function () {
		return this.getItems().map( function ( item ) {
			return item.getData();
		} );
	};

	/**
	 * @param {String[]} data
	 */
	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.setValue = function ( data ) {
		this.clearItems();
		this.addItemsFromData( data );
	};

	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.DeepCategoryFilter.prototype.populateFromStore = function () {
		if ( this.store.hasOptionChanged( this.optionId, this.getValue() ) ) {
			this.setValue( this.store.getOption( this.optionId ) );
		}
	};

}( mediaWiki, jQuery ) );
