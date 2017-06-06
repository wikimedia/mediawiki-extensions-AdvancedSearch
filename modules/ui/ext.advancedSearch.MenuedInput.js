( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.MenuTagMultiselectWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.MenuDataModel} dataSource
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.MenuedInput = function ( dataSource, store, config ) {
		config = config || {};
		this.dataSource = dataSource;
		this.store = store;
		this.optionId = config.optionId;

		dataSource.connect( this, { update: 'onDataSourceUpdate' } );
		store.connect( this, { update: 'onStoreUpdate' } );

		// Parent constructor
		mw.libs.advancedSearch.ui.MenuedInput.parent.call( this, config );

		this.populateFromDataSource();
		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.MenuedInput, OO.ui.MenuTagMultiselectWidget );

	mw.libs.advancedSearch.ui.MenuedInput.prototype.onDataSourceUpdate = function () {
		this.populateFromDataSource();
	};

	mw.libs.advancedSearch.ui.MenuedInput.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.MenuedInput.prototype.populateFromDataSource = function () {
		var menu = this.getMenu(),
			items = [];
		menu.clearItems();

		$.each( this.dataSource.getMenuItems(), function ( key, label ) {
			items.push( new OO.ui.MenuOptionWidget( { data: key, label: label } ) );
		} );
		menu.addItems( items );
	};

	function arrayEquals( a1, a2 ) {
		var i = a1.length;
		while ( i-- ) {
			if ( a1[ i ] !== a2[ i ] ) {
				return false;
			}
		}
		return true;
	}

	mw.libs.advancedSearch.ui.MenuedInput.prototype.populateFromStore = function () {
		var self = this,
			selected = this.store.getOption( this.optionId ),
			menu = this.dataSource.getMenuItems();

		if ( !selected || arrayEquals( selected, this.getValue() ) ) {
			return;
		}

		this.clearItems();
		$.each( selected, function ( idx, key ) {
			self.addTag( key, menu[ key ] );
		} );
	};

} )( mediaWiki );
